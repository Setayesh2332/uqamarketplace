import { supabase } from "./supabaseClient";

/**
 * Créer une nouvelle annonce
 * @param {Object} listingData - Les données de l'annonce du formulaire
 * @param {File[]} imageFiles - Tableau des fichiers image à téléverser
 * @returns {Promise<Object>} L'annonce créée avec les images
 */
export async function createListing(listingData, imageFiles = []) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié pour créer une annonce");
    }

    // Préparer les données de l'annonce pour la base de données
    const listingPayload = {
      user_id: user.id,
      category: listingData.category,
      program: listingData.program || null,
      course: listingData.course || null,
      title: listingData.title,
      condition: listingData.condition,
      description: listingData.description || null,
      price: parseFloat(listingData.price) || 0,
      contact_cell: listingData.contact_cell || false,
      contact_email: listingData.contact_email || false,
      contact_other: listingData.contact_other || false,
      contact_phone: listingData.contact_cell ? listingData.phone : null,
      contact_email_value: listingData.contact_email ? listingData.email : null,
      contact_other_value: listingData.contact_other ? listingData.otherContact : null,
      category_attributes: listingData.category_attributes || {},
      status: "active",
    };

    // Insérer l'annonce dans la base de données
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert([listingPayload])
      .select()
      .single();

    if (listingError) {
      throw listingError;
    }

    // Téléverser les images si fournies
    const imagePaths = [];
    if (imageFiles.length > 0 && listing.id) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${listing.id}/${Date.now()}-${i}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        // Téléverser vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Erreur lors du téléversement de l'image ${i}:`, uploadError);
          // Continuer avec les autres images même si une échoue
          continue;
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        // Insérer l'enregistrement de l'image dans la base de données
        const { error: imageError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listing.id,
            path: urlData.publicUrl,
            display_order: i,
          });

        if (imageError) {
          console.error(`Error saving image record ${i}:`, imageError);
        } else {
          imagePaths.push(urlData.publicUrl);
        }
      }
    }

    // Récupérer l'annonce complète avec les images
    const { data: completeListing, error: fetchError } = await supabase
      .from("listings")
      .select(`
        *,
        listing_images (
          id,
          path,
          display_order
        )
      `)
      .eq("id", listing.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return {
      ...completeListing,
      images: imagePaths,
    };
  } catch (error) {
    console.error("Erreur lors de la création de l'annonce:", error);
    throw error;
  }
}

/**
 * Obtenir toutes les annonces avec filtres optionnels
 * @param {Object} filters - Options de filtrage (catégorie, statut, recherche, etc.)
 * @param {Object} sortOptions - Options de tri (champ, ordre)
 * @param {number} limit - Nombre maximum de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<Object>} Objet avec le tableau des annonces et le total
 */
export async function getListings(filters = {}, sortOptions = {}, limit = 50, offset = 0) {
  try {
    // Utiliser la vue listings_with_profiles qui contient déjà les données du profil
    let query = supabase
      .from("listings_with_profiles")
      .select(`
        *,
        listing_images!listing_images_listing_id_fkey (
          id,
          path,
          display_order
        )
      `, { count: "exact" });

    // Appliquer les filtres
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    } else {
      // Par défaut, uniquement les annonces actives
      query = query.eq("status", "active");
    }

    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.condition) {
      query = query.eq("condition", filters.condition);
    }

    if (filters.search) {
      const searchTerm = filters.search.trim();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      if (searchWords.length > 0) {
        const conditions = searchWords.map(word => 
          `title.ilike.%${word}%,description.ilike.%${word}%,course.ilike.%${word}%,category.ilike.%${word}%`
        );
        query = query.or(conditions.join(','));
      }
    }

    if (filters.min_price !== undefined) {
      query = query.gte("price", filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte("price", filters.max_price);
    }

    // Appliquer le tri
    const sortField = sortOptions.field || "created_at";
    const sortOrder = sortOptions.order || "desc";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Appliquer la pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transformer les données pour construire l'objet profiles à partir des colonnes de la vue
    const listingsWithSortedImages = (data || []).map((listing) => {
      // Construire l'objet profiles à partir des colonnes de la vue
      const profiles = listing.profile_id
        ? {
            id: listing.profile_id,
            first_name: listing.first_name,
            last_name: listing.last_name,
            email: listing.profile_email,
          }
        : null;

      // Retirer les colonnes du profil de l'objet principal pour garder la structure propre
      const {
        profile_id,
        first_name,
        last_name,
        profile_email,
        profile_phone,
        ...listingData
      } = listing;

      return {
        ...listingData,
        listing_images: (listing.listing_images || []).sort(
          (a, b) => a.display_order - b.display_order
        ),
        profiles: profiles,
      };
    });

    return {
      listings: listingsWithSortedImages,
      total: count || 0,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    throw error;
  }
}

/**
 * Obtenir une annonce par son ID
 * @param {string} listingId - L'ID de l'annonce
 * @returns {Promise<Object>} L'annonce avec les images et les informations du vendeur
 */
export async function getListingById(listingId) {
  try {
    // Utiliser la vue listings_with_profiles qui contient déjà les données du profil
    const { data, error } = await supabase
      .from("listings_with_profiles")
      .select(`
        *,
        listing_images!listing_images_listing_id_fkey (
          id,
          path,
          display_order
        )
      `)
      .eq("id", listingId)
      .single();

    if (error) {
      throw error;
    }

    // Construire l'objet profiles à partir des colonnes de la vue
    const profiles = data.profile_id
      ? {
          id: data.profile_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.profile_email,
        }
      : null;

    // Retirer les colonnes du profil de l'objet principal
    const {
      profile_id,
      first_name,
      last_name,
      profile_email,
      profile_phone,
      ...listingData
    } = data;

    // Trier les images par display_order
    if (listingData.listing_images) {
      listingData.listing_images.sort((a, b) => a.display_order - b.display_order);
    }

    return {
      ...listingData,
      profiles: profiles,
      images: (listingData.listing_images || []).map(img => ({
        id: img.id,
        url: img.path
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce:", error);
    throw error;
  }
}

/**
 * Mettre à jour une annonce
 * @param {string} listingId - L'ID de l'annonce
 * @param {Object} updates - Champs à mettre à jour
 * @param {File[]} newImageFiles - Nouveaux fichiers image à ajouter
 * @returns {Promise<Object>} L'annonce mise à jour
 */
export async function updateListing(listingId, updates, newImageFiles = []) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié pour mettre à jour une annonce");
    }

    // D'abord, vérifier que l'utilisateur possède cette annonce
    const { data: existingListing, error: fetchError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (existingListing.user_id !== user.id) {
      throw new Error("Vous ne pouvez mettre à jour que vos propres annonces");
    }

    // Préparer le payload de mise à jour (enlever keep_image_ids)
    const { keep_image_ids, ...updatePayload } = updates;
    
    // Gérer les mises à jour des informations de contact
    if (updates.contact_cell !== undefined) {
      if (!updates.contact_cell) {
        updatePayload.contact_phone = null;
      }
    }
    if (updates.contact_email !== undefined) {
      if (!updates.contact_email) {
        updatePayload.contact_email_value = null;
      }
    }
    if (updates.contact_other !== undefined) {
      if (!updates.contact_other) {
        updatePayload.contact_other_value = null;
      }
    }

    // Gérer la suppression des images
    if (keep_image_ids) {
      // Récupérer toutes les images actuelles
      const { data: allImages } = await supabase
        .from("listing_images")
        .select("id, path")
        .eq("listing_id", listingId);

      if (allImages && allImages.length > 0) {
        // Trouver les images à supprimer
        const imagesToDelete = allImages.filter(
          img => !keep_image_ids.includes(img.id)
        );

        // Supprimer les fichiers du storage et les enregistrements
        for (const image of imagesToDelete) {
          // Extraire le chemin relatif
          const urlMatch = image.path.match(/listing-images\/(.+)/);
          if (urlMatch && urlMatch[1]) {
            const filePath = urlMatch[1];
            await supabase.storage
              .from("listing-images")
              .remove([filePath]);
          }

          // Supprimer l'enregistrement de la base de données
          await supabase
            .from("listing_images")
            .delete()
            .eq("id", image.id);
        }
      }
    }

    // Téléverser les nouvelles images
    if (newImageFiles.length > 0) {
      // Obtenir le nombre actuel d'images pour le display_order
      const { data: existingImages } = await supabase
        .from("listing_images")
        .select("display_order")
        .eq("listing_id", listingId)
        .order("display_order", { ascending: false })
        .limit(1);

      let startOrder = 0;
      if (existingImages && existingImages.length > 0) {
        startOrder = existingImages[0].display_order + 1;
      }

      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${listingId}/${Date.now()}-${i}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        // Téléverser vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Erreur lors du téléversement de l'image ${i}:`, uploadError);
          continue;
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        // Insérer l'enregistrement de l'image
        await supabase
          .from("listing_images")
          .insert({
            listing_id: listingId,
            path: urlData.publicUrl,
            display_order: startOrder + i,
          });
      }
    }

    // Mettre à jour l'annonce
    const { data, error } = await supabase
      .from("listings")
      .update(updatePayload)
      .eq("id", listingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error);
    throw error;
  }
}

/**
 * Supprimer une annonce
 * @param {string} listingId - L'ID de l'annonce
 * @returns {Promise<void>}
 */
export async function deleteListing(listingId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("L'utilisateur doit être authentifié pour supprimer une annonce");
    }

    // Vérifier la propriété
    const { data: existingListing, error: fetchError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (existingListing.user_id !== user.id) {
      throw new Error("Vous ne pouvez supprimer que vos propres annonces");
    }

    // Récupérer les images avant de supprimer l'annonce
    const { data: images } = await supabase
      .from("listing_images")
      .select("path")
      .eq("listing_id", listingId);

    // Supprimer les fichiers du Storage
    if (images && images.length > 0) {
      for (const image of images) {
        // Extraire le chemin relatif depuis l'URL complète
        const urlMatch = image.path.match(/listing-images\/(.+)/);
        if (urlMatch && urlMatch[1]) {
          const filePath = urlMatch[1];
          const { error: deleteError } = await supabase.storage
            .from("listing-images")
            .remove([filePath]);

          if (deleteError) {
            console.warn(`Erreur lors de la suppression du fichier ${filePath}:`, deleteError);
          }
        }
      }
    }

    // Supprimer l'annonce (la cascade supprimera automatiquement les listing_images de la DB)
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    throw error;
  }
}