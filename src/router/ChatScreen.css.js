const styles = {
  messagesContainer: {
    height: "100%",
    width: "100%",
  },
  newMessage: {
    backgroundColor: "#3578E5",
    borderRadius: "8px",
    color: "#FFFFFF",
    display: "flex",
    fontFamily: "Roboto, sans-serif",
    padding: "10px",
    // width: "65%",
    maxWidth: "65%",
    whiteSpace: "pre-wrap",
    fontSize: "16px",
  },
  newMessageContainer: {
    padding: "0px 10px 0px 0px",
    display: "flex",
    flex: "0 0 auto",
    justifyContent: "flex-end",
    width: "100%",
  },
  receivedMessage: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    display: "flex",
    fontFamily: "Roboto, sans-serif",
    padding: "10px",
    // width: "65%",
    maxWidth: "65%",
    whiteSpace: "pre-wrap",
    fontSize: "16px",
  },
  receivedMessageContainer: {
    padding: "0px 0px 0px 10px",
    display: "flex",
    flex: "0 0 auto",
    justifyContent: "flex-start",
    width: "100%",
  },
  header: {
    fontSize: "18px",
    textAlign: "center",
    // padding: "0px 0px 10px 5px",
    margin: "10px 10px 10px 10px",
  },
  time: {
    fontSize: "11px",
    position: "relative",
    left: "4px",
    float: "right",
    alignSelf: "flex-end",
  },
};

export default styles;
