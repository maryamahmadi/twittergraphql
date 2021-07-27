const users = [
  { id: "1", name: "bobsie", role: "REGULAR" },
  { id: "2", name: "kian", role: "ADMIN" },
];
const posts = [
  { id: "1", title: "First Post", body: "First Post Body", userId: "1" },
  { id: "2", title: "Second Post", body: "Second Post Body", userId: "1" },
  { id: "3", title: "Third Post", body: "Third Post Body", userId: "2" },
  { id: "4", title: "Forth Post", body: "Forth Post Body", userId: "2" },
];
let userIdCounter = 2;
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const typeDefs = gql`
  enum Role {
    ADMIN
    REGULAR
  }
  type User {
    name: String!
    id: ID!
    email: String
    role: Role!
    posts: [Post]
  }
  input UserInput {
    name: String
    email: String
    role: Role
  }
  type Post {
    id: ID!
    title: String!
    body: String!
    user: User!
  }

  type Query {
    users: [User]!
    userById(id: ID!): User
    posts: [Post]!
    postById(id: ID!): Post
  }

  type Mutation {
    addUser(user: UserInput!): User
    updateUser(id: ID!, user: UserInput!): User
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return users;
    },
    userById: (parent, { id }) => {
      return users.find((user) => user.id === id);
    },
    posts: () => {
      return posts;
    },
    postById: (parent, { id }) => {
      return posts.find((post) => post.id === id);
    },
  },
  Mutation: {
    addUser: (parent, { user }) => {
      let userCopy = { ...user };
      userCopy.id = (++userIdCounter).toString();
      users.push(userCopy);
      return userCopy;
    },
    updateUser: (parent, { id, user }) => {
      const index = users.findIndex((user) => user.id === id);
      users.splice(index, 1, { ...user, id: users[index].id });
      console.log(users);
      return { ...user, id: users[index].id };
    },
  },
  User: {
    posts: (parent) => {
      return posts.filter((post) => post.userId === parent.id);
    },
  },
  Post: {
    user: (parent) => {
      return users.find((user) => user.id === parent.userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const main = async () => {
  const app = express();
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log("Now browse to http://localhost:4000" + server.graphqlPath)
  );
};
main();
