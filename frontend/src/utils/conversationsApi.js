import { supabase } from "./supabaseClient";

/**
 * Créer ou récupérer une conversation pour une annonce
 * @param {string} listingId - L'ID de l'annonce
 * @returns {Promise<Object>} La conversation créée ou existante
 */
export async function getOrCreateConversation(listingId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié");
    }

    // Récupérer l'annonce pour obtenir le seller_id
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single();

    if (listingError) {
      throw listingError;
    }

    const sellerId = listing.user_id;

    // Vérifier si l'utilisateur n'est pas le vendeur
    if (user.id === sellerId) {
      throw new Error("Vous ne pouvez pas créer une conversation pour votre propre annonce");
    }

    // Vérifier si une conversation existe déjà
    const { data: existingConversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { //no rows returned
      throw fetchError;
    }

    // Si la conversation existe, la retourner
    if (existingConversation) {
      return existingConversation;
    }

    // Sinon, créer une nouvelle conversation
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newConversation;
  } catch (error) {
    console.error("Erreur lors de la création/récupération de la conversation:", error);
    throw error;
  }
}

/**
 * Récupérer toutes les conversations d'un utilisateur
 * @returns {Promise<Array>} Liste des conversations avec les détails de l'annonce et de l'autre utilisateur
 */
export async function getUserConversations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié");
    }

    // Récupérer les conversations où l'utilisateur est acheteur ou vendeur
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        listings (
          id,
          title,
          price,
          listing_images (
            id,
            path,
            display_order
          )
        )
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Récupérer les profils des autres utilisateurs
    const otherUserIds = new Set();
    conversations.forEach(conv => {
      if (conv.buyer_id !== user.id) otherUserIds.add(conv.buyer_id);
      if (conv.seller_id !== user.id) otherUserIds.add(conv.seller_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", Array.from(otherUserIds));

    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Vérifier quelles conversations ont des messages
    // On ne veut afficher que les conversations où il y a eu des échanges
    const conversationIds = conversations.map(conv => conv.id);
    const { data: messagesCount } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds);

    // Créer un Set des conversation_ids qui ont des messages
    const conversationsWithMessages = new Set(
      (messagesCount || []).map(msg => msg.conversation_id)
    );

    // Transformer les données pour faciliter l'utilisation
    // Filtrer pour ne garder que les conversations avec des messages
    return conversations
      .filter(conv => conversationsWithMessages.has(conv.id))
      .map(conv => {
        const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        const otherUser = profilesMap.get(otherUserId);
        const isBuyer = conv.buyer_id === user.id;
        
        // Trier les images par display_order
        const sortedImages = (conv.listings?.listing_images || []).sort(
          (a, b) => a.display_order - b.display_order
        );

        return {
          ...conv,
          otherUser: {
            id: otherUser?.id,
            firstName: otherUser?.first_name,
            lastName: otherUser?.last_name,
            fullName: otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Utilisateur inconnu",
          },
          listing: {
            ...conv.listings,
            listing_images: sortedImages,
          },
          isBuyer,
        };
      });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    throw error;
  }
}

/**
 * Récupérer une conversation spécifique avec ses messages
 * @param {string} conversationId - L'ID de la conversation
 * @returns {Promise<Object>} La conversation avec ses messages et détails
 */
export async function getConversationWithMessages(conversationId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié");
    }

    // Récupérer la conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select(`
        *,
        listings (
          id,
          title,
          price,
          user_id,
          listing_images (
            id,
            path,
            display_order
          )
        )
      `)
      .eq("id", conversationId)
      .single();

    if (convError) {
      throw convError;
    }

    // Vérifier que l'utilisateur fait partie de cette conversation
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw new Error("Vous n'avez pas accès à cette conversation");
    }

    // Vérification supplémentaire : s'assurer qu'un utilisateur ne peut pas accéder à une conversation
    // où il serait à la fois buyer et seller (ne devrait jamais arriver, mais sécurité supplémentaire)
    if (conversation.buyer_id === user.id && conversation.seller_id === user.id) {
      throw new Error("Vous ne pouvez pas accéder à cette conversation");
    }

    // Récupérer les profils des participants
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", conversation.buyer_id)
      .single();

    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", conversation.seller_id)
      .single();

    // Récupérer les messages de cette conversation
    // Les politiques RLS devraient déjà filtrer pour que l'utilisateur ne voie que les messages
    // des conversations auxquelles il participe (buyer ou seller)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Filtrer les messages pour s'assurer qu'ils appartiennent bien à cette conversation
    // et que l'expéditeur est soit l'utilisateur, soit l'autre participant (buyer ou seller)
    const filteredMessages = (messages || []).filter(msg => {
      // Vérifier que l'expéditeur est bien l'un des participants de la conversation
      const isValidSender = msg.sender_id === conversation.buyer_id || 
                           msg.sender_id === conversation.seller_id;
      return isValidSender;
    });

    const otherUser = conversation.buyer_id === user.id ? sellerProfile : buyerProfile;
    const isBuyer = conversation.buyer_id === user.id;

    // Récupérer les profils des expéditeurs des messages
    const senderIds = [...new Set(filteredMessages.map(msg => msg.sender_id))];
    const { data: senderProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", senderIds);

    const senderProfilesMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);

    // Trier les images par display_order
    const sortedImages = (conversation.listings?.listing_images || []).sort(
      (a, b) => a.display_order - b.display_order
    );

    return {
      ...conversation,
      otherUser: {
        id: otherUser?.id,
        firstName: otherUser?.first_name,
        lastName: otherUser?.last_name,
        fullName: otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Utilisateur inconnu",
      },
      listing: {
        ...conversation.listings,
        listing_images: sortedImages,
      },
      isBuyer,
      messages: filteredMessages.map(msg => {
        const sender = senderProfilesMap.get(msg.sender_id);
        return {
          ...msg,
          sender: {
            id: sender?.id,
            firstName: sender?.first_name,
            lastName: sender?.last_name,
            fullName: sender ? `${sender.first_name} ${sender.last_name}` : "Utilisateur inconnu",
          },
          isFromCurrentUser: msg.sender_id === user.id,
        };
      }),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    throw error;
  }
}

/**
 * Envoyer un message dans une conversation
 * @param {string} conversationId - L'ID de la conversation
 * @param {string} content - Le contenu du message
 * @param {File|null} imageFile - Fichier image optionnel
 * @returns {Promise<Object>} Le message créé
 */
export async function sendMessage(conversationId, content, imageFile = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié");
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id, listing_id")
      .eq("id", conversationId)
      .single();

    if (convError) {
      throw convError;
    }

    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw new Error("Vous n'avez pas accès à cette conversation");
    }

    // Vérification supplémentaire : empêcher qu'un utilisateur soit à la fois buyer et seller
    // (ne devrait jamais arriver, mais sécurité supplémentaire)
    if (conversation.buyer_id === user.id && conversation.seller_id === user.id) {
      throw new Error("Vous ne pouvez pas envoyer de messages dans cette conversation");
    }

    // Valider qu'il y a au moins du contenu ou une image
    if (!content?.trim() && !imageFile) {
      throw new Error("Le message doit contenir du texte ou une image");
    }

    let imageUrl = null;

    // Téléverser l'image si fournie
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`;
      const filePath = `messages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images") // Réutiliser le bucket existant
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    // Créer le message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content?.trim() || null,
        image_url: imageUrl,
      })
      .select("*")
      .single();

    if (messageError) {
      throw messageError;
    }

    // Récupérer le profil de l'expéditeur
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", user.id)
      .single();

    return {
      ...message,
      sender: {
        id: senderProfile?.id,
        firstName: senderProfile?.first_name,
        lastName: senderProfile?.last_name,
        fullName: senderProfile ? `${senderProfile.first_name} ${senderProfile.last_name}` : "Utilisateur inconnu",
      },
      isFromCurrentUser: true,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
}

/**
 * S'abonner aux nouveaux messages d'une conversation (Realtime)
 * @param {string} conversationId - L'ID de la conversation
 * @param {Function} callback - Fonction appelée quand un nouveau message arrive
 * @returns {Function} Fonction pour se désabonner
 */
export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Récupérer les détails du message
        const { data: message, error } = await supabase
          .from("messages")
          .select("*")
          .eq("id", payload.new.id)
          .single();

        if (!error && message) {
          // Récupérer le profil de l'expéditeur
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", message.sender_id)
            .single();

          const { data: { user } } = await supabase.auth.getUser();
          callback({
            ...message,
            sender: {
              id: senderProfile?.id,
              firstName: senderProfile?.first_name,
              lastName: senderProfile?.last_name,
              fullName: senderProfile ? `${senderProfile.first_name} ${senderProfile.last_name}` : "Utilisateur inconnu",
            },
            isFromCurrentUser: message.sender_id === user?.id,
          });
        }
      }
    )
    .subscribe();

  // Retourner une fonction pour se désabonner
  return () => {
    supabase.removeChannel(channel);
  };
}

