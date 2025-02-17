interface Tag {
   _id: string;
   name: string;
}

interface Author {
   _id: string;
   name: string;
   image: string;
}

interface Question {
   _id: string;
   title: string;
   tags: Tag[];
   author: Author;
   createdAt: Date;
   upvotes: number;
   answers: number;
   views: number;
}

interface MetricProps {
   imgUrl: string;
   alt: string;
   value: string | number;
   title: string;
   href?: string;
   textStyles?: string;
   imgStyles?: string;
   isAuthor?: boolean;
}
