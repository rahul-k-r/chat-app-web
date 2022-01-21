import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase/firebase.utils";
import { AppBar, Toolbar, IconButton, Button, TextField } from "@mui/material";
import { Mood } from "@mui/icons-material";
import {
  doc,
  collection,
  setDoc,
  limit,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

// async function getLastMessageFromFirestore(userId, chatId) {
//   return lastMessage;
// }

async function sendTimeStampMarker(userId, chatId, count) {
  let newChatRefSender, newChatRefReceiver;
  const currentTime = new Date();
  const timeStamp = Timestamp.fromDate(
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    )
  );
  // console.log(timeStamp);
  if (chatId === "chat") {
    newChatRefSender = doc(collection(db, "chat"));
  } else {
    newChatRefSender = doc(
      collection(db, "chats/" + userId + "/chat/" + chatId + "/messages")
    );
    newChatRefReceiver = doc(
      collection(db, "chats/" + chatId + "/chat/" + userId + "/messages")
    );
  }
  setDoc(newChatRefSender, {
    count: count,
    sent: true,
    text: "timeStampMarker",
    createdAt: timeStamp,
    userId: "",
    username: "",
    userImage: "",
    viewedBy: [
      {
        uid: userId,
        timeStamp: new Date(),
      },
    ],
  });
  if (chatId !== "chat") {
    setDoc(newChatRefReceiver, {
      count: count,
      sent: false,
      text: "timeStampMarker",
      createdAt: timeStamp,
      userId: "",
      username: "",
      userImage: "",
      viewedBy: [
        {
          uid: userId,
          timeStamp: new Date(),
        },
      ],
    });
  }
}

const ChatBar = (props) => {
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState("");
  const [lastMessage, setLastMessage] = useState();
  const inputRef = useRef();

  useEffect(() => {
    setLastMessage(undefined);
    let q;
    if (props.chat === "chat") {
      q = query(collection(db, "chat"), limit(1), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(
          db,
          "chats/" + props.userId + "/chat/" + props.chat + "/messages"
        ),
        limit(1),
        orderBy("createdAt", "desc")
      );
    }
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.size > 0) {
        let item = querySnapshot.docs[0].data();
        // console.log(item);
        setLastMessage({
          id: querySnapshot.docs[0].id,
          count: item.count,
          username: item.username,
          sent: item.sent,
          createdAt: item.createdAt,
          userId: item.userId,
          userImage: item.userImage,
          text: item.text,
          viewedBy: item.viewedBy,
        });
      }
    });
    inputRef.current.focus();
  }, [chatId]);

  function sendMessage(e) {
    setChatId(props.chat + " ");
    setChatId(props.chat);
    let count = 0;
    // console.log(lastMessage);
    if (lastMessage === undefined) {
      count = 1;
      sendTimeStampMarker(props.userId, chatId, count);
    } else {
      if (lastMessage.text === "timeStampMarker") count = 1;
      else if (lastMessage.userId === props.userId) {
        count = lastMessage.count + 1;
      } else {
        count = 1;
      }
      let dateFormatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      let date = dateFormatter.formatToParts(
        lastMessage.createdAt.seconds * 1000
      );
      const timeLastFormatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(date[4].value, date[0].value - 1, date[2].value));
      const timeNowFormatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      // console.log(timeLastFormatted);
      // console.log(timeNowFormatted);
      if (timeLastFormatted !== timeNowFormatted) {
        sendTimeStampMarker(props.userId, chatId, count);
        count = 1;
      }
    }
    // console.log(props.userImage);
    e.preventDefault();
    let newChatRefSender, newChatRefReceiver;

    if (chatId === "chat") {
      newChatRefSender = doc(collection(db, "chat"));
    } else {
      newChatRefSender = doc(
        collection(
          db,
          "chats/" + props.userId + "/chat/" + chatId + "/messages"
        )
      );
      newChatRefReceiver = doc(
        collection(
          db,
          "chats/" + chatId + "/chat/" + props.userId + "/messages"
        )
      );
    }
    if (text.length > 0) {
      setDoc(newChatRefSender, {
        count: count,
        sent: true,
        text: text,
        createdAt: Timestamp.now(),
        userId: props.userId,
        username: props.username,
        userImage: props.userImage,
        viewedBy: [
          {
            uid: props.userId,
            timeStamp: new Date(),
          },
        ],
      });
      if (chatId !== "chat") {
        setDoc(newChatRefReceiver, {
          count: count,
          sent: false,
          text: text,
          createdAt: Timestamp.now(),
          userId: props.userId,
          username: props.username,
          userImage: props.userImage,
          viewedBy: [
            {
              uid: props.userId,
              timeStamp: new Date(),
            },
          ],
        });
        setDoc(doc(db, "chats/" + props.userId + "/chat", props.chat), {
          lastMessage: text,
          modifiedAt: Timestamp.now(),
          image_url: props.contactImage,
          username: props.contactUsername,
          isMine: true,
        });
        setDoc(doc(db, "chats/" + props.chat + "/chat", props.userId), {
          lastMessage: text,
          modifiedAt: Timestamp.now(),
          image_url: props.userImage,
          username: props.username,
          isMine: false,
        });
      }
      setText("");
    }
  }

  return (
    <div
      style={{
        padding: "0.5em 0.5em 0em 0.5em",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
      className="chat-bar"
    >
      <IconButton edge="start" color="inherit" aria-label="send">
        <Mood />
      </IconButton>
      <div style={{ flexGrow: 1 }}>
        <form onSubmit={sendMessage} noValidate>
          <TextField
            focus
            id="outlined-basic"
            label="Type a message"
            variant="outlined"
            value={chatId === props.chat ? text : ""}
            fullWidth
            multiline
            maxRows={4}
            ref={inputRef}
            onChange={(e) => {
              setChatId(props.chat);
              setText(e.target.value);
            }}
            onKeyPress={(e) => {
              //Send message on "Enter" and new line on "Shift+Enter"
              if (e.key === "Enter" && !e.shiftKey) {
                sendMessage(e);
              }
            }}
            InputProps={{
              endAdornment: (
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={sendMessage}
                >
                  Send
                </Button>
              ),
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatBar;
