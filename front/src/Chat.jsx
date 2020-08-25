import React, { useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useSubscription, useMutation } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Row, Col, FormInput, Button } from "shards-react";

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});
const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;
const POST_MESSAGES = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;
const Messages = ({ user }) => {
  const { data } = useSubscription (GET_MESSAGES);

  if (!data) {
    return null;
  }
  return (
    <div
      style={{
        height: "70vh",
        overflow: "scroll",
        border: "solid 3px orchid",
        borderRadius: "5px",
        marginTop: "20px",
        padding: "20px",
      }}
    >
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          key={id}
          style={{
            display: "flex",
            justifyContent: user === messageUser ? "flex-end" : "flex-start",
            margin: "5px",
          }}
        >
          {user !== messageUser && (
            <div
              style={{
                height: "40px",
                width: "40px",
                border: "2px dotted gainsboro",
                borderRadius: "25px",
                textAlign: "center",
                paddingTop: "5px",
                marginRight: "5px",
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? "orchid" : "gainsboro",
              color: user === messageUser ? "white" : "black",
              padding: "10px",
              borderRadius: "1rem",
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </div>
  );
};

const Chat = () => {
  const [state, setState] = useState({
    user: "Loic",
    content: "",
  });
  const [postMessage] = useMutation(POST_MESSAGES);
  const sendMessage = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }
    setState({
      ...state,
      content: "",
    });
  };
  return (
    <Container
      style={{
        height: "100vh",
      }}
    >
      <Messages user={state.user} />
      <Row
        style={{
          marginTop: "50px",
          marginBottom: "30px",
        }}
      >
        <Col xs={2}>
          <FormInput
            label="User"
            value={state.user}
            onChange={(e) =>
              setState({
                ...state,
                user: e.target.value,
              })
            }
          />
        </Col>
        <Col xs={8}>
          <FormInput
            label="Content"
            value={state.content}
            onChange={(e) =>
              setState({
                ...state,
                content: e.target.value,
              })
            }
            onKeyUp={(e) => {
              if (e.keyCode === 13) {
                sendMessage();
              }
            }}
          />
        </Col>
        <Col xs={2}>
          <Button onClick={() => sendMessage()}>Send It !</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
