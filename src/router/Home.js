import React, { useEffect, useRef, useState } from "react";
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
  ListItemIcon,
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
  getDoc,
} from "firebase/firestore";
import { Create, Menu, Group } from "@material-ui/icons";
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
            <Grid item lg={8} md={7} sm={6} xs={6}>
              <Typography
                variant="body2"
                className="inline"
                color="textPrimary"
                noWrap
              >
                {props.sentUsername + props.lastMessage}
              </Typography>
            </Grid>
            <Grid item lg={4} md={5} sm={6} xs={6}>
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

const ContactListItemCustom = (props) => {
  const handleListItemClick = (event, index) => {
    props.setSelectedIndex(0);
    props.setContactSelector(false);
    let chats = props.chats;
    if (chats[0].id !== "chat" && chats[0].lastMessage === "") {
      chats.splice(0, 1);
      props.setChats(chats);
    }
    const indexOf = chats.findIndex((x) => x.id === props.id);
    if (indexOf === -1) {
      let chat = {
        id: props.id,
        username: props.username,
        image_url: props.url,
        lastMessage: "",
        modifiedAt: { seconds: 0, nanoseconds: 0 },
        isMine: false,
      };
      chats.unshift(chat);
      props.setChats(chats);
    } else {
      props.setSelectedIndex(indexOf);
    }
  };
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
      />
    </ListItemButton>
  );
};

const Home = (props) => {
  const { width, height } = useWindowDimensions();
  const user = props.user;
  const logout = props.logout;
  const userId = user.reloadUserInfo.localId;
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [contactSelector, setContactSelector] = useState(false);
  const [chats, setChats] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [selectedChatId, setSelectedChatId] = React.useState("");
  const [groupSelector, setGroupSelector] = React.useState(false);
  const [groupList, setGroupList] = React.useState([]);
  const listRef = useRef({});

  useEffect(() => {
    // console.log(user.reloadUserInfo);
    getDoc(doc(db, "users", userId)).then((doc) => {
      // console.log(doc.data());
      setUsername(doc.data().username);
      setProfileImage(doc.data().image_url);
      // console.log(doc.data().image_url);
    });

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
    const unsubscribe2 = onSnapshot(
      query(collection(db, "users"), orderBy("username", "asc")),
      (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== userId) {
            let item = doc.data();
            users.push({
              id: doc.id,
              email: item.email,
              username: item.username,
              image_url: item.image_url,
            });
          }
        });
        setContactList(users);
      }
    );
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0) {
      setSelectedChatId(chats[selectedIndex].id);
      listRef.current.scrollToItem(selectedIndex);
    }
    if (selectedIndex > 0) {
      if (chats[0].id !== "chat" && chats[0].lastMessage === "") {
        let chat = chats;
        chat.shift();
        setChats(chat);
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== -1 && chats[selectedIndex].id !== selectedChatId) {
      setSelectedIndex(
        chats.findIndex((chat) => {
          console.log(chat.id);
          console.log(selectedChatId);
          return chat.id === selectedChatId;
        })
      );
    }
  }, [chats]);

  useEffect(() => {
    if (!contactSelector) {
      setGroupSelector(false);
    }
  }, [contactSelector]);

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

  const ContactSelector = ({ index, style }) => {
    setSelectedIndex(-1);
    setSelectedChatId("");
    return (
      <div style={style}>
        <ContactListItemCustom
          index={index}
          id={contactList[index].id}
          url={contactList[index].image_url}
          username={contactList[index].username}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setContactSelector={setContactSelector}
          chats={chats}
          setChats={setChats}
        />
      </div>
    );
  };

  return (
    <div style={{ height: "100vh" }}>
      {/* <Box sx={{ flexGrow: 1 }}> */}

      {/* <Box>
        <Typography variant="h1">This is home</Typography>
        <h1>Hello, {user.displayName}</h1>
        <h1>You are signed in as {user.email}</h1>
        <button onClick={logout}>Sign Out</button>
      </Box> */}
      <Grid container spacing={0}>
        <Grid item lg={2} md={3} sm={4} xs={5}>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="profile">
                <Avatar src={profileImage} />
              </IconButton>
              <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                {username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          <ListItemButton
            role={undefined}
            selected={contactSelector}
            onClick={() => setContactSelector(!contactSelector)}
          >
            <ListItemIcon>
              <Create />
            </ListItemIcon>
            <ListItemText primary="Start New Conversation" />
          </ListItemButton>
          {contactSelector ? (
            <ListItemButton
              role={undefined}
              selected={groupSelector}
              onClick={() => setGroupSelector(!groupSelector)}
            >
              <ListItemIcon>
                <Group />
              </ListItemIcon>
              <ListItemText primary="New Group" />
            </ListItemButton>
          ) : null}

          <div
            style={{
              flexGrow: 1,
              height: contactSelector ? height - 170 : height - 120,
            }}
          >
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  itemCount={
                    contactSelector ? contactList.length : chats.length
                  }
                  itemSize={75}
                  width={width}
                  ref={listRef}
                >
                  {contactSelector ? ContactSelector : ChatSelector}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        </Grid>
        <Grid item lg={10} md={9} sm={8} xs={7}>
          <AppBar position="static">
            <Toolbar>
              {selectedIndex !== -1 && (
                <IconButton edge="start" color="inherit" aria-label="menu">
                  <Avatar src={chats[selectedIndex].image_url} alt="" />
                </IconButton>
              )}
              {selectedIndex !== -1 && (
                <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                  {chats[selectedIndex].username}
                </Typography>
              )}
            </Toolbar>
          </AppBar>

          {selectedIndex !== -1 && (
            <div style={{ flex: "1 1 auto", height: height - 150 }}>
              {/* <Typography variant="h2">Chat</Typography> */}

              <ChatScreen userId={userId} chat={chats[selectedIndex]} />
            </div>
          )}
          {selectedIndex !== -1 && (
            <ChatBar
              userId={userId}
              username={username}
              userImage={profileImage}
              chat={chats[selectedIndex].id}
              contactUsername={chats[selectedIndex].username}
              contactImage={chats[selectedIndex].image_url}
            />
          )}
        </Grid>
      </Grid>
      {/* </Box> */}
    </div>
  );
};
export default Home;
