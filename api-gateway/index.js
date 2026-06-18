const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./src/graphql/schema');
const rootResolver = require('./src/graphql/resolvers');
const restRoutes = require('./src/rest/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Clinic Management API Gateway',
    rest: '/api',
    graphql: '/graphql',
  });
});

app.use('/api', restRoutes);

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: rootResolver,
  graphiql: true,
}));

app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  const NOT_FOUND_CODE = 5;
  const statusCode = err.code === NOT_FOUND_CODE ? 404 : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    details: err.details || '',
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`REST endpoints: http://localhost:${PORT}/api`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
