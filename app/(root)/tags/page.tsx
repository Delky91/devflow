import React from "react";

import { getTags } from "@/lib/actions/tag.actions";

const TagsPage = async () => {
   const { success, error, data } = await getTags({
      page: 1,
      pageSize: 10,
   });

   const { tags } = data || {};
   console.log("TAGS", JSON.stringify(tags, null, 2));

   return <div>TagsPage</div>;
};

export default TagsPage;
