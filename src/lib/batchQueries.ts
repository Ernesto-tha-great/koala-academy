/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

type QueryType = "dashboard" | "articles" | "users";

function useBatchedQueries(type: QueryType = "dashboard") {
  // Call all hooks unconditionally at the top level
  const articles = useQuery(api.articles.list, { limit: 10 });
  const stats = useQuery(api.admin.getStats);
  const allArticles = useQuery(api.articles.list, { limit: 10 });
  const tags = useQuery(api.tags.list, { limit: 10 });

  // Then use the results based on type
  switch (type) {
    case "dashboard":
      return {
        isLoading: !articles || !stats,
        data: { articles, stats }
      };
    
    case "articles":
      return {
        isLoading: !allArticles || !tags,
        data: { articles: allArticles, tags }
      };
    
    // Add more cases as needed
    default:
      return {
        isLoading: false,
        data: {}
      };
  }
}

export default useBatchedQueries;