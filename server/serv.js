const { GraphQLServer, PubSub } = require("graphql-yoga");

const messages = [];
/**
 * @ID! with exclamation point said that this id is required
 */
const typeDefs = `
type Message {
    id:ID!
    user: String!
    content: String!
}
type Query {
    messages: [Message!]
}
type Mutation {
    postMessage(user: String!, content: String!): ID!
}
type Subscription {
  messages: [Message!]
}
`;

const subscribers = [];
const onMessageUpdates = (fct) => subscribers.push(fct);
const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, { user, content }) => {
      const id = messages.length;
      messages.push({
        id,
        user,
        content,
      });
      subscribers.forEach((fct) => fct());
      return id;
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15);
        onMessageUpdates(() => pubsub.publish(channel, { messages }));
        setTimeout(() => pubsub.publish(channel, { messages }), 0);
        return pubsub.asyncIterator(channel);
      },
    },
  },
};
const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(({ port }) => {
  console.log(port);
});
