/**
 * WordPress/GraphQL API
 *
 * Централизованный экспорт всех функций для работы с WordPress
 */

// API функции
export {
  // Doctors
  getDoctors,
  getDoctorsConnection,
  getDoctorBySlug,
  getFeaturedDoctors,
  getAllDoctorsSlugs,
  getDoctorsForSitemap,
  getDoctorSpecializations,
  getSpecializationBySlug,
  getAllSpecializationsSlugs,
  // Services
  getServices,
  getServiceBySlug,
  getPopularServices,
  getAllServicesSlugs,
  // Posts
  getPosts,
  getPostBySlug,
  getRecentPosts,
  getPostsForBlogSection,
  getPostsConnection,
  getAllPostsSlugs,
  getAllCategories,
  getCategoryBySlug,
  getAllCategoriesSlugs,
  getPostsByCategory,
  getRelatedPosts,
  getRelatedPostsForCards,
  getWordPressTimezone,
  // Reviews
  getReviews,
  getReviewsFilterOptions,
  getFeaturedReviews,
  // Our Works
  getOurWorks,
  getOurWorksConnection,
  getOurWorksFilterOptions,
  // Promotions
  getPromotions,
  getPromotionBySlug,
  getPromotionsForHomepage,
  getPromotionsConnection,
  getPromotionFilterOptions,
  getAllPromotionsSlugs,
  // Service categories (taxonomy)
  getAllServiceCategories,
  getServiceCategoryBySlug,
  getAllServiceCategoriesSlugs,
  // Problematics (taxonomy)
  getAllProblematics,
  getProblematicBySlug,
  getAllProblematicsSlugs,
  // Prices
  getPricesByCategories,
  getPriceArchiveSettings,
  getActionsArchiveSettings,
  getOurWorksArchiveSettings,
  getContactsSettings,
  getServicePagesSettings,
  getMainPageSettings,
  getReviewsArchiveSettings,
  // Types
  type Doctor,
  type DoctorsPageInfo,
  type Service,
  type Post,
  type PostCategory,
  type BlogPostCard,
  type PostsPageInfo,
  type Promotion,
  type PromotionsFilters,
  type PromotionsPageInfo,
  type PromotionServiceCategory,
  type OurWorksFilters,
  type ReviewsRatingFilter,
  type ReviewPlatform,
} from "./api";

// Apollo Client
export { getApolloClient, fetchGraphQL } from "./client";

// Queries (если нужно использовать напрямую)
export * from "./queries/doctors";
export * from "./queries/services";
export * from "./queries/posts";
export * from "./queries/reviews";
export * from "./queries/our-works";
export * from "./queries/promotions";

// Types
export type { Review } from "./types/review";
export type { OurWork } from "./types/our-work";
