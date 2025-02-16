// Websites
export interface Websites {
    website_url: string;
    settings: {
        title: string;
        description: string;
        logo: string;
        favicon: string;
        theme: string;
    };
    created_at: string;
    updated_at: string;
}

export interface WebsiteProperties {
    property_id: string;
    title: string;
    excerpt: string;
    property_type: string;
    location: {
        town: string;
        municipality: string;
    };
    price: number;
    thumbnail_url: string;
    website_status: string;
    created_at: string;
    updated_on: string;
}


/*
  websites/
  └── {website_id}
      ├── properties/
      │   └── {property_id}/
      │       ├── thumbnail_url:
      │       ├── Reference:
      │       ├── title:
      │       ├── excerpt:
      │       ├── property_type:
      │       ├── location:
      │       ├── price:
      │       ├── website_status:
      │       └── updated_on:
      │
      ├── website_url:
      ├── settings
      │	├── theme:
      │	└── status:
      └── updated_on:	
*/          