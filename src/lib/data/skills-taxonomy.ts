export interface Skill {
  id: string;
  name: string;
  category?: string;
  verified?: boolean;
  popularity?: number;
  isPopular?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[];
}

export interface CustomSkill {
  id: string;
  name: string;
  category?: string;
  isCustom: true;
  createdBy: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export const skillsCategories: SkillCategory[] = [
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Frontend and backend web technologies',
    icon: '🌐',
    skills: [
      { id: 'react', name: 'React', category: 'web-development', isPopular: true },
      { id: 'vue', name: 'Vue.js', category: 'web-development', isPopular: true },
      { id: 'angular', name: 'Angular', category: 'web-development' },
      { id: 'nodejs', name: 'Node.js', category: 'web-development', isPopular: true },
      { id: 'nextjs', name: 'Next.js', category: 'web-development' },
      { id: 'nuxtjs', name: 'Nuxt.js', category: 'web-development' },
      { id: 'svelte', name: 'Svelte', category: 'web-development' },
      { id: 'typescript', name: 'TypeScript', category: 'web-development', isPopular: true },
      { id: 'javascript', name: 'JavaScript', category: 'web-development', isPopular: true },
      { id: 'html-css', name: 'HTML/CSS', category: 'web-development', isPopular: true },
      { id: 'sass', name: 'Sass/SCSS', category: 'web-development' },
      { id: 'tailwind', name: 'Tailwind CSS', category: 'web-development' },
      { id: 'bootstrap', name: 'Bootstrap', category: 'web-development' },
      { id: 'webpack', name: 'Webpack', category: 'web-development' },
      { id: 'vite', name: 'Vite', category: 'web-development' },
    ]
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    description: 'Server-side technologies and APIs',
    icon: '⚙️',
    skills: [
      { id: 'python', name: 'Python', category: 'backend-development', isPopular: true },
      { id: 'java', name: 'Java', category: 'backend-development' },
      { id: 'csharp', name: 'C#', category: 'backend-development' },
      { id: 'php', name: 'PHP', category: 'backend-development', isPopular: true },
      { id: 'ruby', name: 'Ruby', category: 'backend-development' },
      { id: 'go', name: 'Go', category: 'backend-development' },
      { id: 'rust', name: 'Rust', category: 'backend-development' },
      { id: 'django', name: 'Django', category: 'backend-development' },
      { id: 'flask', name: 'Flask', category: 'backend-development' },
      { id: 'express', name: 'Express.js', category: 'backend-development' },
      { id: 'laravel', name: 'Laravel', category: 'backend-development' },
      { id: 'spring', name: 'Spring Boot', category: 'backend-development' },
      { id: 'dotnet', name: '.NET', category: 'backend-development' },
      { id: 'rails', name: 'Ruby on Rails', category: 'backend-development' },
    ]
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    description: 'iOS, Android, and cross-platform mobile apps',
    icon: '📱',
    skills: [
      { id: 'react-native', name: 'React Native', category: 'mobile-development', isPopular: true },
      { id: 'flutter', name: 'Flutter', category: 'mobile-development', isPopular: true },
      { id: 'ios-swift', name: 'iOS (Swift)', category: 'mobile-development' },
      { id: 'android-kotlin', name: 'Android (Kotlin)', category: 'mobile-development' },
      { id: 'android-java', name: 'Android (Java)', category: 'mobile-development' },
      { id: 'xamarin', name: 'Xamarin', category: 'mobile-development' },
      { id: 'ionic', name: 'Ionic', category: 'mobile-development' },
      { id: 'cordova', name: 'Apache Cordova', category: 'mobile-development' },
      { id: 'unity', name: 'Unity (Mobile Games)', category: 'mobile-development' },
    ]
  },
  {
    id: 'design-ux',
    name: 'Design & UX',
    description: 'User interface and user experience design',
    icon: '🎨',
    skills: [
      { id: 'ui-design', name: 'UI Design', category: 'design-ux', isPopular: true },
      { id: 'ux-design', name: 'UX Design', category: 'design-ux', isPopular: true },
      { id: 'figma', name: 'Figma', category: 'design-ux', isPopular: true },
      { id: 'sketch', name: 'Sketch', category: 'design-ux' },
      { id: 'adobe-xd', name: 'Adobe XD', category: 'design-ux' },
      { id: 'photoshop', name: 'Adobe Photoshop', category: 'design-ux' },
      { id: 'illustrator', name: 'Adobe Illustrator', category: 'design-ux' },
      { id: 'indesign', name: 'Adobe InDesign', category: 'design-ux' },
      { id: 'after-effects', name: 'After Effects', category: 'design-ux' },
      { id: 'prototyping', name: 'Prototyping', category: 'design-ux' },
      { id: 'wireframing', name: 'Wireframing', category: 'design-ux' },
      { id: 'user-research', name: 'User Research', category: 'design-ux' },
      { id: 'branding', name: 'Branding', category: 'design-ux' },
      { id: 'logo-design', name: 'Logo Design', category: 'design-ux' },
    ]
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    description: 'Data analysis, visualization, and business intelligence',
    icon: '📊',
    skills: [
      { id: 'sql', name: 'SQL', category: 'data-analytics', isPopular: true },
      { id: 'python-data', name: 'Python (Data Science)', category: 'data-analytics', isPopular: true },
      { id: 'r-programming', name: 'R Programming', category: 'data-analytics' },
      { id: 'excel-advanced', name: 'Advanced Excel', category: 'data-analytics', isPopular: true },
      { id: 'tableau', name: 'Tableau', category: 'data-analytics', isPopular: true },
      { id: 'power-bi', name: 'Power BI', category: 'data-analytics', isPopular: true },
      { id: 'google-analytics', name: 'Google Analytics', category: 'data-analytics' },
      { id: 'pandas', name: 'Pandas', category: 'data-analytics' },
      { id: 'numpy', name: 'NumPy', category: 'data-analytics' },
      { id: 'matplotlib', name: 'Matplotlib', category: 'data-analytics' },
      { id: 'seaborn', name: 'Seaborn', category: 'data-analytics' },
      { id: 'jupyter', name: 'Jupyter Notebooks', category: 'data-analytics' },
      { id: 'machine-learning', name: 'Machine Learning', category: 'data-analytics' },
      { id: 'statistics', name: 'Statistics', category: 'data-analytics' },
    ]
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    description: 'Online marketing and growth strategies',
    icon: '📈',
    skills: [
      { id: 'seo', name: 'SEO', category: 'digital-marketing', isPopular: true },
      { id: 'sem-ppc', name: 'SEM/PPC', category: 'digital-marketing', isPopular: true },
      { id: 'social-media', name: 'Social Media Marketing', category: 'digital-marketing', isPopular: true },
      { id: 'content-marketing', name: 'Content Marketing', category: 'digital-marketing' },
      { id: 'email-marketing', name: 'Email Marketing', category: 'digital-marketing' },
      { id: 'google-ads', name: 'Google Ads', category: 'digital-marketing' },
      { id: 'facebook-ads', name: 'Facebook Ads', category: 'digital-marketing' },
      { id: 'linkedin-ads', name: 'LinkedIn Ads', category: 'digital-marketing' },
      { id: 'conversion-optimization', name: 'Conversion Optimization', category: 'digital-marketing' },
      { id: 'marketing-automation', name: 'Marketing Automation', category: 'digital-marketing' },
      { id: 'copywriting', name: 'Copywriting', category: 'digital-marketing' },
      { id: 'brand-strategy', name: 'Brand Strategy', category: 'digital-marketing' },
    ]
  },
  {
    id: 'devops-cloud',
    name: 'DevOps & Cloud',
    description: 'Infrastructure, deployment, and cloud services',
    icon: '☁️',
    skills: [
      { id: 'aws', name: 'Amazon Web Services (AWS)', category: 'devops-cloud', isPopular: true },
      { id: 'azure', name: 'Microsoft Azure', category: 'devops-cloud' },
      { id: 'gcp', name: 'Google Cloud Platform', category: 'devops-cloud' },
      { id: 'docker', name: 'Docker', category: 'devops-cloud', isPopular: true },
      { id: 'kubernetes', name: 'Kubernetes', category: 'devops-cloud' },
      { id: 'terraform', name: 'Terraform', category: 'devops-cloud' },
      { id: 'jenkins', name: 'Jenkins', category: 'devops-cloud' },
      { id: 'github-actions', name: 'GitHub Actions', category: 'devops-cloud' },
      { id: 'gitlab-ci', name: 'GitLab CI/CD', category: 'devops-cloud' },
      { id: 'ansible', name: 'Ansible', category: 'devops-cloud' },
      { id: 'linux', name: 'Linux Administration', category: 'devops-cloud' },
      { id: 'nginx', name: 'Nginx', category: 'devops-cloud' },
      { id: 'apache', name: 'Apache', category: 'devops-cloud' },
    ]
  },
  {
    id: 'database',
    name: 'Database Management',
    description: 'Database design, administration, and optimization',
    icon: '🗄️',
    skills: [
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', isPopular: true },
      { id: 'mysql', name: 'MySQL', category: 'database', isPopular: true },
      { id: 'mongodb', name: 'MongoDB', category: 'database', isPopular: true },
      { id: 'redis', name: 'Redis', category: 'database' },
      { id: 'elasticsearch', name: 'Elasticsearch', category: 'database' },
      { id: 'sqlite', name: 'SQLite', category: 'database' },
      { id: 'oracle', name: 'Oracle Database', category: 'database' },
      { id: 'sql-server', name: 'SQL Server', category: 'database' },
      { id: 'cassandra', name: 'Apache Cassandra', category: 'database' },
      { id: 'dynamodb', name: 'DynamoDB', category: 'database' },
      { id: 'firebase', name: 'Firebase', category: 'database' },
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Information security and risk management',
    icon: '🔒',
    skills: [
      { id: 'penetration-testing', name: 'Penetration Testing', category: 'cybersecurity' },
      { id: 'vulnerability-assessment', name: 'Vulnerability Assessment', category: 'cybersecurity' },
      { id: 'security-auditing', name: 'Security Auditing', category: 'cybersecurity' },
      { id: 'incident-response', name: 'Incident Response', category: 'cybersecurity' },
      { id: 'compliance', name: 'Compliance (SOC2, ISO27001)', category: 'cybersecurity' },
      { id: 'network-security', name: 'Network Security', category: 'cybersecurity' },
      { id: 'application-security', name: 'Application Security', category: 'cybersecurity' },
      { id: 'risk-management', name: 'Risk Management', category: 'cybersecurity' },
    ]
  },
  {
    id: 'business-analysis',
    name: 'Business Analysis',
    description: 'Business process analysis and requirements gathering',
    icon: '📋',
    skills: [
      { id: 'requirements-gathering', name: 'Requirements Gathering', category: 'business-analysis' },
      { id: 'process-mapping', name: 'Process Mapping', category: 'business-analysis' },
      { id: 'stakeholder-management', name: 'Stakeholder Management', category: 'business-analysis' },
      { id: 'documentation', name: 'Technical Documentation', category: 'business-analysis' },
      { id: 'user-stories', name: 'User Story Writing', category: 'business-analysis' },
      { id: 'agile-scrum', name: 'Agile/Scrum', category: 'business-analysis' },
      { id: 'project-management', name: 'Project Management', category: 'business-analysis' },
      { id: 'business-intelligence', name: 'Business Intelligence', category: 'business-analysis' },
    ]
  },
  {
    id: 'content-writing',
    name: 'Content & Writing',
    description: 'Content creation, copywriting, and technical writing',
    icon: '✍️',
    skills: [
      { id: 'content-writing', name: 'Content Writing', category: 'content-writing', isPopular: true },
      { id: 'copywriting-sales', name: 'Sales Copywriting', category: 'content-writing' },
      { id: 'technical-writing', name: 'Technical Writing', category: 'content-writing' },
      { id: 'blog-writing', name: 'Blog Writing', category: 'content-writing' },
      { id: 'social-media-content', name: 'Social Media Content', category: 'content-writing' },
      { id: 'email-copywriting', name: 'Email Copywriting', category: 'content-writing' },
      { id: 'grant-writing', name: 'Grant Writing', category: 'content-writing' },
      { id: 'proofreading', name: 'Proofreading & Editing', category: 'content-writing' },
      { id: 'seo-writing', name: 'SEO Content Writing', category: 'content-writing' },
    ]
  },
  {
    id: 'video-multimedia',
    name: 'Video & Multimedia',
    description: 'Video production, editing, and multimedia content',
    icon: '🎬',
    skills: [
      { id: 'video-editing', name: 'Video Editing', category: 'video-multimedia', isPopular: true },
      { id: 'motion-graphics', name: 'Motion Graphics', category: 'video-multimedia' },
      { id: 'video-production', name: 'Video Production', category: 'video-multimedia' },
      { id: 'animation', name: '2D/3D Animation', category: 'video-multimedia' },
      { id: 'premiere-pro', name: 'Adobe Premiere Pro', category: 'video-multimedia' },
      { id: 'final-cut', name: 'Final Cut Pro', category: 'video-multimedia' },
      { id: 'davinci-resolve', name: 'DaVinci Resolve', category: 'video-multimedia' },
      { id: 'audio-editing', name: 'Audio Editing', category: 'video-multimedia' },
      { id: 'podcast-production', name: 'Podcast Production', category: 'video-multimedia' },
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online store development and management',
    icon: '🛒',
    skills: [
      { id: 'shopify', name: 'Shopify', category: 'ecommerce', isPopular: true },
      { id: 'woocommerce', name: 'WooCommerce', category: 'ecommerce', isPopular: true },
      { id: 'magento', name: 'Magento', category: 'ecommerce' },
      { id: 'bigcommerce', name: 'BigCommerce', category: 'ecommerce' },
      { id: 'squarespace', name: 'Squarespace', category: 'ecommerce' },
      { id: 'stripe-integration', name: 'Stripe Integration', category: 'ecommerce' },
      { id: 'paypal-integration', name: 'PayPal Integration', category: 'ecommerce' },
      { id: 'inventory-management', name: 'Inventory Management', category: 'ecommerce' },
      { id: 'product-photography', name: 'Product Photography', category: 'ecommerce' },
    ]
  },
  {
    id: 'automation',
    name: 'Automation & Integration',
    description: 'Process automation and system integrations',
    icon: '🤖',
    skills: [
      { id: 'zapier', name: 'Zapier', category: 'automation', isPopular: true },
      { id: 'api-integration', name: 'API Integration', category: 'automation', isPopular: true },
      { id: 'workflow-automation', name: 'Workflow Automation', category: 'automation' },
      { id: 'rpa', name: 'Robotic Process Automation', category: 'automation' },
      { id: 'webhook-integration', name: 'Webhook Integration', category: 'automation' },
      { id: 'crm-integration', name: 'CRM Integration', category: 'automation' },
      { id: 'erp-integration', name: 'ERP Integration', category: 'automation' },
    ]
  }
];

// Helper functions
export const getAllSkills = (): Skill[] => {
  return skillsCategories.flatMap(category => category.skills);
};

export const getPopularSkills = (): Skill[] => {
  return getAllSkills().filter(skill => skill.isPopular);
};

export const getSkillsByCategory = (categoryId: string): Skill[] => {
  const category = skillsCategories.find(cat => cat.id === categoryId);
  return category ? category.skills : [];
};

export const searchSkills = (query: string): Skill[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllSkills().filter(skill => 
    skill.name.toLowerCase().includes(lowercaseQuery)
  );
};

export const getCategoryBySkillId = (skillId: string): SkillCategory | null => {
  return skillsCategories.find(category => 
    category.skills.some(skill => skill.id === skillId)
  ) || null;
};

// Experience levels
export const experienceLevels = [
  { id: 'beginner', name: 'Beginner', description: '0-1 years experience' },
  { id: 'intermediate', name: 'Intermediate', description: '1-3 years experience' },
  { id: 'advanced', name: 'Advanced', description: '3-5 years experience' },
  { id: 'expert', name: 'Expert', description: '5+ years experience' },
] as const;

export type ExperienceLevel = typeof experienceLevels[number]['id'];

// Advanced skill features
export const getSkillVerificationStatus = (skillName: string): 'verified' | 'pending' | 'unverified' => {
  const skill = getAllSkills().find(s => s.name === skillName)
  return skill?.verified ? 'verified' : 'unverified'
}

export const getSkillMatchScore = (userSkills: string[], projectSkills: string[]): number => {
  const matches = userSkills.filter(skill => projectSkills.includes(skill))
  return projectSkills.length > 0 ? (matches.length / projectSkills.length) * 100 : 0
}

export const suggestRelatedSkills = (skillName: string): Skill[] => {
  const skill = getAllSkills().find(s => s.name === skillName)
  if (!skill) return []
  
  const category = getCategoryBySkillId(skill.id)
  if (!category) return []
  
  return category.skills
    .filter(s => s.name !== skillName)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
}

export const getSkillTrends = (): { skill: string; trend: 'rising' | 'stable' | 'declining'; change: number }[] => {
  return [
    { skill: 'Next.js', trend: 'rising', change: 25 },
    { skill: 'TypeScript', trend: 'rising', change: 18 },
    { skill: 'React', trend: 'stable', change: 2 },
    { skill: 'Vue.js', trend: 'stable', change: -1 },
    { skill: 'Angular', trend: 'declining', change: -8 },
    { skill: 'Svelte', trend: 'rising', change: 35 },
    { skill: 'Tailwind CSS', trend: 'rising', change: 42 },
    { skill: 'GraphQL', trend: 'rising', change: 15 }
  ]
}

export const validateCustomSkill = (skillName: string): { valid: boolean; reason?: string } => {
  if (skillName.length < 2) {
    return { valid: false, reason: 'Skill name must be at least 2 characters long' }
  }
  
  if (skillName.length > 50) {
    return { valid: false, reason: 'Skill name must be less than 50 characters' }
  }
  
  if (getAllSkills().some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
    return { valid: false, reason: 'This skill already exists in our database' }
  }
  
  const invalidChars = /[^a-zA-Z0-9\s\-\+\#\.]/
  if (invalidChars.test(skillName)) {
    return { valid: false, reason: 'Skill name contains invalid characters' }
  }
  
  return { valid: true }
}

export const getSkillAnalytics = (skills: string[]) => {
  const allSkills = getAllSkills()
  const categories = skills.reduce((acc, skillName) => {
    const skill = allSkills.find(s => s.name === skillName)
    if (skill) {
      const category = getCategoryBySkillId(skill.id)
      if (category) {
        acc[category.name] = (acc[category.name] || 0) + 1
      }
    }
    return acc
  }, {} as Record<string, number>)
  
  const totalPopularity = skills.reduce((sum, skillName) => {
    const skill = allSkills.find(s => s.name === skillName)
    return sum + (skill?.popularity || 0)
  }, 0)
  
  const averagePopularity = skills.length > 0 ? totalPopularity / skills.length : 0
  
  return {
    categories,
    totalSkills: skills.length,
    averagePopularity: Math.round(averagePopularity),
    marketability: averagePopularity > 70 ? 'high' : averagePopularity > 40 ? 'medium' : 'low'
  }
}

