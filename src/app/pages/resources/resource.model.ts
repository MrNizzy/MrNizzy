export interface Resources {
  items: Resource[];
  count: number;
}

export interface Resource {
  resource_id: string;
  name: string;
  url: string;
  url_image: string;
  url_repository: string;
  description: string;
  type: string;
  category: string;
  tags: string[];
  click_count: number;
  upvotes: number;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export const RESOURCES: Resources = {
  items: [],
  count: 0,
};

export const RESOURCE: Resource = {
  resource_id: '',
  name: 'Unknown',
  url: 'https://mrnizzy.me',
  url_image: 'https://mrnizzy.me/mrnizzy.webp',
  url_repository: 'https://github.com/MrNizzy',
  description: 'Unknown',
  type: 'Unknown',
  category: 'Unknown',
  tags: [],
  click_count: 0,
  upvotes: 0,
  view_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
};
