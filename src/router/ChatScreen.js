import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebase.utils";
import { VariableSizeList } from "react-window";
import {
  onSnapshot,
  getDocs,
  collection,
  query,
  orderBy,
  setDoc,
  doc,
} from "firebase/firestore";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Avatar,
  Container,
  Box,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  ListItemButton,
  TextField,
  ListSubheader,
} from "@mui/material";
import { AutoSizer } from "react-virtualized";
import styles from "./ChatScreen.css";
// import { Mood } from "@mui/icons-material";
// import { flexbox, height } from "@mui/system";

// const ChatListItemCustom = (props) => {
//   let time = new Intl.DateTimeFormat("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(props.createdAt.seconds * 1000);

//   return (
//     <ListItem alignItems="flex-start">
//       <ListItemAvatar>
//         <Avatar alt="" src={props.userImage} />
//       </ListItemAvatar>
//       <ListItemText
//         primary={props.username}
//         secondary={
//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <Typography
//               component="span-block"
//               variant="body1"
//               className="inline"
//               color="textPrimary"
//             >
//               {props.text}
//             </Typography>
//             <Typography
//               component="span-block"
//               variant="body2"
//               className="inline"
//               color="textPrimary"
//               noWrap
//             >
//               {time}
//             </Typography>
//           </div>
//         }
//       />
//     </ListItem>
//   );
// };

const ChatListItemCustomTImeStamp = (props) => {
  if (
    props.date[0].value === props.createdAtDate[0].value &&
    props.date[4].value === props.createdAtDate[4].value
  ) {
    if (
      parseInt(props.date[2].value) - parseInt(props.createdAtDate[2].value) ===
      1
    )
      return (
        <ListItem>
          <ListItemText
            primary={"Yesterday"}
            primaryTypographyProps={{ align: "center" }}
          />
        </ListItem>
      );
    else if (props.date[2].value === props.createdAtDate[2].value)
      return (
        <ListItem>
          <ListItemText
            primary={"Today"}
            primaryTypographyProps={{ align: "center" }}
          />
        </ListItem>
      );
    else
      return (
        <ListItem>
          <ListItemText
            primary={
              props.createdAtDate[2].value +
              "/" +
              props.createdAtDate[0].value +
              "/" +
              props.createdAtDate[4].value
            }
            primaryTypographyProps={{ align: "center" }}
          />
        </ListItem>
      );
  } else {
    return (
      <ListItem>
        <ListItemText
          primary={
            props.createdAtDate[2].value +
            "/" +
            props.createdAtDate[0].value +
            "/" +
            props.createdAtDate[4].value
          }
          primaryTypographyProps={{ align: "center" }}
        />
      </ListItem>
    );
  }
};

const ChatScreen = (props) => {
  const [chat, setChat] = useState([]);
  const [chatId, setChatId] = useState("");
  const listRef = useRef({});
  const rowHeights = useRef({});
  const q = query(
    collection(
      db,
      "chats/" + props.userId + "/chat/" + props.chat.id + "/messages"
    ),
    orderBy("createdAt", "desc")
  );

  useEffect(() => {
    setChatId(props.chat.id);
    let q;
    if (props.chat.id === "chat") {
      q = query(collection(db, "chat"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(
          db,
          "chats/" + props.userId + "/chat/" + props.chat.id + "/messages"
        ),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let chats = [];
      querySnapshot.forEach((doc) => {
        let item = doc.data();
        chats.unshift({
          id: doc.id,
          count: item.count,
          username: item.username,
          sent: item.sent,
          createdAt: item.createdAt,
          userId: item.userId,
          userImage: item.userImage,
          text: item.text,
          viewedBy: item.viewedBy,
        });
      });
      setChat(chats);
      // console.log(chats.length);
    });
  }, [props.chat.id]);

  useEffect(() => {
    if (chat.length > 0) {
      // console.log(chat[chat.length - 1].count);
      let modifier = 0;
      if (chat[chat.length - 1].userId !== props.userId)
        modifier = chat[chat.length - 1].count - 1;
      listRef.current.scrollToItem(chat.length - modifier - 1);
    }
  }, [chat]);

  function getRowHeight(index) {
    return rowHeights.current[index] + 8 || 82;
  }

  function setRowHeight(index, size) {
    listRef.current.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  }

  const ChatListRenderer = ({ index, style }) => {
    const rowRef = useRef({});

    let time = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(chat[index].createdAt.seconds * 1000);

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
      // eslint-disable-next-line
    }, [rowRef]);

    if (chat[index].text === "timeStampMarker") {
      let today = new Date();
      let dateFormatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      let date = dateFormatter.formatToParts(
        chat[index].createdAt.seconds * 1000
      );
      let dateParts = dateFormatter.formatToParts(today);
      return (
        <div style={style}>
          <ChatListItemCustomTImeStamp
            key={index}
            text={chat[index].text}
            createdAt={chat[index].createdAt}
            createdAtDate={date}
            date={dateParts}
          />
        </div>
      );
    }
    return (
      <div style={style}>
        {chat[index].userId === props.userId ? (
          <div ref={rowRef} style={styles.newMessageContainer}>
            <div style={styles.newMessage}>
              <span>{chat[index].text}</span>
              <span style={styles.time}>{time}</span>
            </div>
          </div>
        ) : (
          <div ref={rowRef}>
            {index !== 0 && chat[index - 1].text === "timeStampMarker" && (
              <div style={styles.receivedMessageContainer}>
                <Avatar
                  alt={chat[index].username}
                  src={chat[index].userImage}
                  sx={{
                    height: "30px",
                    width: "30px",
                    margin: "7px 5px 5px 5px",
                  }}
                />
                <p style={styles.header}>{chat[index].username}</p>
              </div>
            )}
            {index !== 0 &&
              chat[index - 1].text !== "timeStampMarker" &&
              chat[index].userId !== chat[index - 1].userId && (
                <div style={styles.receivedMessageContainer}>
                  <Avatar
                    alt={chat[index].username}
                    src={chat[index].userImage}
                    sx={{
                      height: "30px",
                      width: "30px",
                      margin: "7px 5px 5px 5px",
                    }}
                  />{" "}
                  <p style={styles.header}>{chat[index].username}</p>
                </div>
              )}
            <div style={styles.receivedMessageContainer}>
              <div style={styles.receivedMessage}>
                <div>{chat[index].text}</div>
                <div style={styles.time}>{time}</div>
              </div>
            </div>
          </div>
        )}
        {/* <ChatListItemCustom
          key={index}
          id={chat[index].id}
          count={chat[index].count}
          username={chat[index].username}
          sent={chat[index].sent}
          createdAt={chat[index].createdAt}
          userId={chat[index].userId}
          userImage={chat[index].userImage}
          text={chat[index].text}
          viewedBy={chat[index].viewedBy}
        /> */}
      </div>
    );
  };
  return (
    <AutoSizer style={styles.messagesContainer}>
      {({ height, width }) => (
        <VariableSizeList
          height={height}
          itemCount={chat.length}
          itemSize={getRowHeight}
          width={width}
          ref={listRef}
          // initialScrollOffset={(chat.length - 10) * 75}
        >
          {ChatListRenderer}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
};

export default ChatScreen;
