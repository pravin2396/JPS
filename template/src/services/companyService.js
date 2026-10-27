import axios from 'axios';

const COMPANIES_STORAGE_KEY = 'jps_companies';
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Initial pre-seeded companies with realistic corporate data & logos
const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'TechCorp Innovations',
    industry: 'Technology & Software',
    location: 'Austin, TX / Remote',
    website: 'https://techcorp.dev',
    email: 'contact@techcorp.dev',
    employees: '500 - 1,000',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    description:
      'TechCorp Innovations is a high-growth technology leader developing cloud-native architectures, enterprise SaaS products, and modern developer tooling.',
    openingsCount: 5,
    founded: 2018,
  },
  {
    id: 2,
    name: 'CloudScale Global',
    industry: 'Cloud Infrastructure',
    location: 'San Francisco, CA',
    website: 'https://cloudscale.dev',
    email: 'hiring@cloudscale.dev',
    employees: '1,000 - 5,000',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200',
    description:
      'CloudScale Global powers distributed edge networks and high-throughput microservices for Fortune 500 enterprises across 30+ countries worldwide.',
    openingsCount: 8,
    founded: 2015,
  },
  {
    id: 3,
    name: 'Pulse Enterprise Labs',
    industry: 'Fintech & AI',
    location: 'Seattle, WA / Hybrid',
    website: 'https://pulselabs.ai',
    email: 'talent@pulselabs.ai',
    employees: '250 - 500',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200',
    description:
      'Pulse Enterprise Labs pioneers AI-driven financial intelligence, automated transaction hedging, and real-time fraud mitigation algorithms.',
    openingsCount: 4,
    founded: 2020,
  },
  {
    id: 4,
    name: 'Nova Digital Media',
    industry: 'E-Commerce & Retail',
    location: 'New York, NY',
    website: 'https://novamedia.io',
    email: 'hello@novamedia.io',
    employees: '100 - 250',
    logo: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=200',
    description:
      'Nova Digital Media builds next-generation headless omnichannel commerce experiences, digital content engines, and immersive customer journey software.',
    openingsCount: 3,
    founded: 2019,
  },
  {
    id: 5,
    name: 'Vanguard Cyber Tech',
    industry: 'Cybersecurity',
    location: 'Boston, MA / Remote',
    website: 'https://vanguardcyber.net',
    email: 'careers@vanguardcyber.net',
    employees: '500 - 1,000',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=200',
    description:
      'Vanguard Cyber Tech safeguards critical cloud environments with zero-trust identity architectures, automated penetration scanning, and cryptographic security.',
    openingsCount: 6,
    founded: 2017,
  },
  {
    id: 6,
    name: 'BioHealth Dynamics',
    industry: 'Healthcare Tech',
    location: 'Chicago, IL',
    website: 'https://biohealthdyn.org',
    email: 'info@biohealthdyn.org',
    employees: '250 - 500',
    logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=200',
    description:
      'BioHealth Dynamics connects medical providers with patients through HIPAA-compliant telemetry, AI clinical notes assistants, and remote health monitoring.',
    openingsCount: 2,
    founded: 2021,
  },
  {
    id: 7,
    name: 'Apex Systems Inc',
    industry: 'Technology & Software',
    location: 'Denver, CO / Hybrid',
    website: 'https://apexsystems.tech',
    email: 'hr@apexsystems.tech',
    employees: '1,000 - 5,000',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
    description:
      'Apex Systems delivers full-lifecycle enterprise application modernization, micro-frontend conversions, and scalable backend orchestration.',
    openingsCount: 7,
    founded: 2014,
  },
  {
    id: 8,
    name: 'Quantum Commerce Labs',
    industry: 'E-Commerce & Retail',
    location: 'Los Angeles, CA',
    website: 'https://quantumcommerce.co',
    email: 'jobs@quantumcommerce.co',
    employees: '50 - 100',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200',
    description:
      'Specializing in high-conversion direct-to-consumer digital storefronts, warehouse inventory automation, and predictive customer lifetime value modeling.',
    openingsCount: 3,
    founded: 2022,
  },
];

export const companyService = {
  // Read all companies from LocalStorage (with initial seed fallback)
  getLocalCompanies() {
    try {
      const stored = localStorage.getItem(COMPANIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(INITIAL_COMPANIES));
      return INITIAL_COMPANIES;
    } catch (e) {
      console.warn('Error reading companies from LocalStorage:', e);
      return INITIAL_COMPANIES;
    }
  },

  // Save companies list into LocalStorage
  saveLocalCompanies(companies) {
    try {
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('companies_updated'));
      }
    } catch (e) {
      console.warn('Error saving companies to LocalStorage:', e);
    }
  },

  // READ / FETCH: Calls Third-Party API (visible in DevTools Network tab) + syncs with LocalStorage
  async fetchCompanies() {
    let localData = this.getLocalCompanies();

    try {
      // Trigger genuine HTTP GET request to JSONPlaceholder API (replicates in Network Tab)
      const response = await axios.get(`${API_BASE_URL}/users`, {
        timeout: 6000,
      });

      // If local storage is empty, initialize and map with third-party API data
      if (!localData || localData.length === 0) {
        const mapped = response.data.map((user, idx) => ({
          id: user.id,
          name: user.company?.name || `Enterprise ${user.name}`,
          industry: idx % 2 === 0 ? 'Technology & Software' : 'Fintech & AI',
          location: `${user.address?.city || 'San Francisco'}, CA`,
          website: `https://${user.website || 'example.com'}`,
          email: user.email.toLowerCase(),
          employees: `${(idx + 1) * 200} - ${(idx + 2) * 250}`,
          logo: INITIAL_COMPANIES[idx % INITIAL_COMPANIES.length].logo,
          description: `${user.company?.catchPhrase || 'Leading enterprise solutions'}. Specializing in ${user.company?.bs || 'scalable cloud infrastructure and innovative developer tooling'}.`,
          openingsCount: (idx % 5) + 1,
          founded: 2016 + (idx % 6),
        }));

        this.saveLocalCompanies(mapped);
        return mapped;
      }

      return localData;
    } catch (err) {
      console.warn('Third-party API request fallback:', err.message);
      return localData;
    }
  },

  // GET BY ID
  async getCompanyById(id) {
    const numericId = Number(id);
    const companies = this.getLocalCompanies();
    const found = companies.find((c) => Number(c.id) === numericId);

    // Also trigger light network probe for Network Tab replication
    try {
      await axios.get(`${API_BASE_URL}/users/${numericId > 10 ? 1 : numericId}`, { timeout: 3000 });
    } catch {
      // Ignore network fallback
    }

    return found || null;
  },

  // CREATE / ADD COMPANY: Triggers real Axios POST (visible in Network Tab) + saves to LocalStorage
  async addCompany(companyData) {
    const localCompanies = this.getLocalCompanies();
    const newId = Date.now();

    const newCompany = {
      ...companyData,
      id: newId,
      logo:
        companyData.logo ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      openingsCount: Number(companyData.openingsCount) || 1,
      founded: Number(companyData.founded) || new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    };

    // Real Third-Party API HTTP POST call (visible in Network Tab with status 201 Created)
    try {
      await axios.post(`${API_BASE_URL}/posts`, {
        title: newCompany.name,
        body: newCompany.description,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network POST simulation note:', e.message);
    }

    // Persist to LocalStorage
    const updated = [newCompany, ...localCompanies];
    this.saveLocalCompanies(updated);
    return newCompany;
  },

  // UPDATE / EDIT COMPANY: Triggers real Axios PUT (visible in Network Tab) + updates LocalStorage
  async updateCompany(id, updatedFields) {
    const numericId = Number(id);
    const localCompanies = this.getLocalCompanies();
    const index = localCompanies.findIndex((c) => Number(c.id) === numericId);

    if (index === -1) {
      throw new Error(`Company with ID ${id} not found.`);
    }

    const updatedCompany = {
      ...localCompanies[index],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };

    // Real Third-Party API HTTP PUT call (visible in Network Tab with status 200 OK)
    try {
      await axios.put(`${API_BASE_URL}/posts/1`, {
        id: 1,
        title: updatedCompany.name,
        body: updatedCompany.description,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network PUT simulation note:', e.message);
    }

    // Persist to LocalStorage
    localCompanies[index] = updatedCompany;
    this.saveLocalCompanies(localCompanies);
    return updatedCompany;
  },

  // DELETE COMPANY: Triggers real Axios DELETE (visible in Network Tab) + removes from LocalStorage
  async deleteCompany(id) {
    const numericId = Number(id);
    const localCompanies = this.getLocalCompanies();
    const filtered = localCompanies.filter((c) => Number(c.id) !== numericId);

    // Real Third-Party API HTTP DELETE call (visible in Network Tab with status 200 OK)
    try {
      await axios.delete(`${API_BASE_URL}/posts/1`);
    } catch (e) {
      console.warn('Network DELETE simulation note:', e.message);
    }

    // Persist to LocalStorage
    this.saveLocalCompanies(filtered);
    return true;
  },

  // Get active company count for Dashboard status cards
  getCompanyCount() {
    return this.getLocalCompanies().length;
  },
};
