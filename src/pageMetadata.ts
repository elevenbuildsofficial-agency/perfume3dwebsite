import { content } from './content';

export const pageMetadata={
  home:{path:'/',title:content.seo.title,description:content.seo.description,type:'WebPage'},
  about:{path:'/about/',title:content.about.seoTitle,description:content.about.seoDescription,type:'AboutPage'},
  contact:{path:'/contact/',title:'Contact Morrow — A conversation starts here',description:'A question about your next scent? Get in touch with Morrow. Explore our demo contact page and preview an enquiry.',type:'ContactPage'},
  finder:{path:'/find-your-morrow/',title:'Find your kind of Morrow — Your scent, by instinct',description:'Three simple questions. Three distinct perfumes. Discover whether First Light, Velvet Hour or Wild Ground feels like you.',type:'WebPage'},
} as const;
export type SitePage=keyof typeof pageMetadata;
export const pageFromPath=(path:string):SitePage=>path.startsWith('/about')?'about':path.startsWith('/contact')?'contact':path.startsWith('/find-your-morrow')?'finder':'home';
