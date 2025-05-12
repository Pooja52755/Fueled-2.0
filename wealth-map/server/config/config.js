module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'wealthmapsecret',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/wealth-map',
  emailService: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  apiKeys: {
    openStreetMap: process.env.OPEN_STREET_MAP_API_KEY,
    nycOpenData: process.env.NYC_OPEN_DATA_API_KEY,
    censusApi: process.env.CENSUS_API_KEY
  },
  apiEndpoints: {
    nominatim: 'https://nominatim.openstreetmap.org/search',
    nycProperties: 'https://data.cityofnewyork.us/resource/64uk-42ks.json',
    mockUsers: 'https://dummyjson.com/users',
    mockCompanies: 'https://fakerapi.it/api/v1/companies',
    randomUsers: 'https://randomuser.me/api',
    censusData: 'https://api.census.gov/data/2019/acs/acs5'
  }
};
