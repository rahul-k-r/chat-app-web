import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FixedSizeList } from "react-window";
// import { Container, Box, Typography, Grid } from "@material-ui/core";
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
} from "@mui/material";
import { db } from "../firebase/firebase.utils";
import {
  doc,
  getDocs,
  limit,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Menu } from "@material-ui/icons";
import ChatScreen from "./ChatScreen";
import ChatBar from "./ChatBar";
import useWindowDimensions from "./useWindowDimenetions";
import { AutoSizer, List as AutoList } from "react-virtualized";

function showChat(params) {}

const ListItemCustom = (props) => {
  const handleListItemClick = (event, index) => {
    props.setSelectedIndex(index);
  };
  let time;
  if (props.modifiedAt === "") time = "";
  else
    time = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(props.modifiedAt.seconds * 1000);
  return (
    <ListItemButton
      selected={props.selectedIndex === props.index}
      onClick={(event) => {
        handleListItemClick(event, props.index);
      }}
      alignItems="flex-start"
    >
      <ListItemAvatar>
        <Avatar alt="" src={props.url} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="body1"
            className="inline"
            color="textPrimary"
            noWrap
          >
            {props.username}
          </Typography>
        }
        secondary={
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item lg={7} md={7} sm={6} xs={6}>
              <Typography
                variant="body2"
                className="inline"
                color="textPrimary"
                noWrap
              >
                {props.sentUsername + props.lastMessage}
              </Typography>
            </Grid>
            <Grid item lg={5} md={5} sm={6} xs={6}>
              {/* <span style={{ float: "right" }}> */}
              <Typography
                variant="body2"
                className="inline"
                color="textPrimary"
                align="right"
                noWrap
              >
                {time}
              </Typography>
              {/* </span> */}
            </Grid>
          </Grid>
        }
      />
    </ListItemButton>
  );
};

// const ListRender = (chats, userId, selectedIndex, setSelectedIndex) => {
//   // let chat = await getDataFromFirestore(userId);
//   return chats.map((element, index) => {
//     return (
//       <div key={index} style={{ maxHeight: 100 + "px" }}>
//         <ListItemCustom
//           index={index}
//           url={element.image_url}
//           username={element.username}
//           lastMessage={element.lastMessage}
//           modifiedAt={element.modifiedAt}
//           isMine={element.isMine}
//           selectedIndex={selectedIndex}
//           setSelectedIndex={setSelectedIndex}
//         />
//         {index != chats.length - 1 && (
//           <Divider variant="inset" component="li" />
//         )}
//       </div>
//     );
//   });
// };

const Home = (props) => {
  const { width, height } = useWindowDimensions();
  const user = props.user;
  const logout = props.logout;
  const userId = user.reloadUserInfo.localId;
  const username = user.reloadUserInfo.displayName;
  const profileImage = user.reloadUserInfo.photoUrl;
  const [chats, setChats] = useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [selectedChatId, setSelectedChatId] = React.useState("");

  useEffect(() => {
    // console.log(user.reloadUserInfo);
    const q = query(
      collection(db, "chats/" + userId + "/chat"),
      orderBy("modifiedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let chats = [
        {
          id: "chat",
          image_url: "",
          username: "Group Chat",
          lastMessage: "",
          modifiedAt: { seconds: 0, nanoseconds: 0 },
          isMine: false,
        },
      ];
      querySnapshot.forEach((doc) => {
        let item = doc.data();
        chats.push({
          id: doc.id,
          image_url: item.image_url,
          username: item.username,
          lastMessage: item.lastMessage,
          isMine: item.isMine,
          modifiedAt: item.modifiedAt,
        });
      });
      setChats(chats);
    });
  }, []);

  // useEffect(() => {
  //   if (selectedIndex >= 0) {
  //     setSelectedChatId(chats[selectedIndex].id);
  //   }
  // }, [selectedIndex]);

  // useEffect(() => {
  //   if (chats[selectedIndex].id !== selectedChatId) {
  //     setSelectedIndex(chats.findIndex((chat) => chat.id === selectedChatId));
  //   }
  // }, [chats]);

  const ChatSelector = ({ index, style }) => {
    const [lastMessage, setLastMessage] = useState();
    useEffect(() => {
      setLastMessage(undefined);
      let q;
      if (chats[index].id === "chat") {
        q = query(
          collection(db, "chat"),
          limit(1),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(
            db,
            "chats/" + userId + "/chat/" + chats[index].id + "/messages"
          ),
          limit(1),
          orderBy("createdAt", "desc")
        );
      }
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.size > 0) {
          let item = querySnapshot.docs[0].data();
          console.log(item);
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
    }, [index]);
    return (
      <div style={style}>
        <ListItemCustom
          index={index}
          url={chats[index].image_url}
          username={chats[index].username}
          sentUsername={
            lastMessage
              ? lastMessage.userId === userId
                ? ""
                : lastMessage.username.split(" ")[0] + ": "
              : ""
          }
          lastMessage={lastMessage ? lastMessage.text : ""}
          modifiedAt={lastMessage ? lastMessage.createdAt : ""}
          isMine={lastMessage ? lastMessage.userId === userId : false}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>
    );
  };

  return (
    <div style={{ height: "100vh" }}>
      {/* <Box sx={{ flexGrow: 1 }}> */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu />
          </IconButton>
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            Home
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {/* <Box>
        <Typography variant="h1">This is home</Typography>
        <h1>Hello, {user.displayName}</h1>
        <h1>You are signed in as {user.email}</h1>
        <button onClick={logout}>Sign Out</button>
      </Box> */}
      <Grid container spacing={2}>
        <Grid item lg={2} md={3} sm={4} xs={5}>
          <div style={{ flex: "1 1 auto", height: height - 100 }}>
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  itemCount={chats.length}
                  itemSize={75}
                  width={width}
                >
                  {ChatSelector}
                </FixedSizeList>
              )}
            </AutoSizer>

            {/* <FixedSizeList
              height={1200}
              itemCount={chats.length}
              itemSize={75}
              width={"100%"}
            >
              {ChatSelector}
            </FixedSizeList> */}
            {/* <List
              sx={{ width: "100%", maxWidth: 400, bgcolor: "background.paper" }}
            > */}
            {/* <Divider variant="inset" component="li" /> */}
            {/* {ListRender(chats, userId, selectedIndex, setSelectedIndex)}
            </List> */}
          </div>
        </Grid>
        <Grid item lg={10} md={9} sm={8} xs={7}>
          <div style={{ flex: "1 1 auto", height: height - 140 }}>
            {/* <Typography variant="h2">Chat</Typography> */}
            {selectedIndex !== -1 && (
              <ChatScreen userId={userId} chat={chats[selectedIndex]} />
            )}
          </div>
          {selectedIndex !== -1 && (
            <ChatBar
              userId={userId}
              username={username}
              userImage={profileImage}
              chat={chats[selectedIndex].id}
              contactUsername={chats[selectedIndex].username}
              contactUrl={chats[selectedIndex].image_url}
            />
          )}
        </Grid>
      </Grid>
      {/* </Box> */}
    </div>
  );
};
export default Home;
