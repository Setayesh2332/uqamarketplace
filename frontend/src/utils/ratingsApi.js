import { supabase } from "./supabaseClient";

/**
 * Récupère toutes les évaluations pour un vendeur spécifique
 * @param {string} sellerId - L'ID du vendeur pour lequel récupérer les évaluations
 * @returns {Promise<{ratings: Array, averageRating: number, totalVotes: number}>}
 */
export async function getSellerRatings(sellerId) {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("seller_id", sellerId);

    if (error) throw error;

    const ratings = data || [];
    const totalVotes = ratings.length;
    const averageRating = totalVotes > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalVotes
      : 0;

    return {
      ratings,
      averageRating,
      totalVotes,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations du vendeur:", error);
    throw error;
  }
}

/**
 * Récupère l'évaluation d'un utilisateur spécifique pour un vendeur
 * @param {string} sellerId - L'ID du vendeur
 * @param {string} userId - L'ID de l'utilisateur qui a évalué
 * @returns {Promise<Object|null>}
 */
export async function getUserRatingForSeller(sellerId, userId) {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("seller_id", sellerId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évaluation de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Soumettre ou mettre à jour une évaluation pour un vendeur
 * @param {string} sellerId - L'ID du vendeur évalué
 * @param {string} userId - L'ID de l'utilisateur qui évalue
 * @param {number} rating - La valeur de l'évaluation (1-5)
 * @returns {Promise<Object>}
 */
export async function submitRating(sellerId, userId, rating) {
  try {
    // Vérifier si l'utilisateur a déjà évalué ce vendeur
    const existingRating = await getUserRatingForSeller(sellerId, userId);

    let result;
    if (existingRating) {
      // Mettre à jour l'évaluation existante
      const { data, error } = await supabase
        .from("ratings")
        .update({
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq("seller_id", sellerId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insérer une nouvelle évaluation
      const { data, error } = await supabase
        .from("ratings")
        .insert([
          {
            seller_id: sellerId,
            user_id: userId,
            rating,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la soumission de l'évaluation:", error);
    throw error;
  }
}

/**
 * Supprimer l'évaluation d'un utilisateur pour un vendeur
 * @param {string} sellerId - L'ID du vendeur
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {Promise<void>}
 */
export async function deleteRating(sellerId, userId) {
  try {
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("seller_id", sellerId)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'évaluation:", error);
    throw error;
  }
}
