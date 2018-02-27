export const typeDefs = `
type Query {
  book(id: ID!): Book
  books(author: String, id: Int): [Book]
}

type Mutation {
  addBook(title: String!, author: String!): Book
  deleteBook(id: ID!): Book
}

type Book {
  id: ID!,
  title: String,
  author: String
}
`;

export default typeDefs;
