import React,{Component} from 'react';
import "./messenger.scss";
import classNames from "classnames";
import avatar from "../images/avatar.png";
import {OrderedMap} from "immutable";
import _ from "lodash";
import {ObjectId} from "../../helpers/objectId"; 
import settingsButton from "../../icons/settings.svg";
import createButton from "../../icons/create.svg"

class Messenger extends Component {
  constructor(props){
    super(props);
    this.state = {
      height:window.innerHeight,
      newMessage:"",
    }
    this._onResize = this._onResize.bind(this);
    this.addTestmessage = this.addTestmessage.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.scrollMessageToBottom = this.scrollMessageToBottom.bind(this);
  }

  renderMessage(message){

    const text = _.get(message,"body","");
    const html = _.split(text,"\n").map((msg,key)=>{
      return <p key={key} dangerouslySetInnerHTML={{__html:msg}}></p>
    })
    return html;
  }

  handleSend(){
    const {newMessage} = this.state;
    const {store} = this.props;

    if(_.trim(newMessage).length){
      const messageId = new ObjectId().toString();
      const channel = store.getActiveChannel();
      const channelId = _.get(channel,"_id",null);
      const currentUser = store.getCurrentUser();
      const message = {
        _id:messageId,
        channelId:channelId,
        body:newMessage,
        author:_.get(currentUser,"name"),
        avatar:avatar,
        me:true,
      }
      store.addMessage(messageId,message)
      this.setState({newMessage:""})
    }
  }

  _onResize(){
    this.setState({height:window.innerHeight})
  }

  addTestmessage(){

    const {store} = this.props;


    // Create Test Messages
    for(let i=0; i<100; i++){
      let isMe = false;
      if(i % 2 === 0){
        isMe=true;
      }
      const newMsg = {
        _id:`${i}`,
        author:`Author: ${i}`,
        body:`Message :${i}`,
        avatar:avatar,
        me: isMe,
      }

      store.addMessage(i,newMsg);
    }

    // Create Test Channels
    for(let c=0; c<10; c++){
      const newChannel = {
        _id:`${c}`,
        title:`Channel ${c}`,
        lastMessage:`Hey there...${c}`,
        members:new OrderedMap({
          "2":true,
          "3":true,
        }),
        messages:new OrderedMap(),
      }

      const msgId = `${c}`;
      newChannel.messages = newChannel.messages.set(msgId,true);
      store.addChannel(c,newChannel);
    }

  }

  scrollMessageToBottom(){
    if(this.messageRef){
      this.messageRef.scrollTop = this.messageRef.scrollHeight;
    }
  }

  componentDidMount(){
    window.addEventListener("resize",this._onResize)
    this.addTestmessage()
  }

  componentDidUpdate(){
    console.log("Component did update");
    this.scrollMessageToBottom()
  }

  componentWillUnmount(){
    window.removeEventListener("resize",this._onResize)
  }

  render(){
    
    const {store} = this.props;
    const {height} = this.state
    const style={
      height:height
    };

    const activeChannel = store.getActiveChannel();
    const messages = store.getMessagesFromChannel(activeChannel); //store.getMessages();
    const channels = store.getChannels();
    const members = store.getMembersFromChannel(activeChannel);

    return(
      <div style={style} className="app-messenger">

{/* ----------------------HEADER-------------------------------------------------------------------------------------------------------------------------------- */}
            <div className="header">
                <div className="left">
                    <button className="left-action"><img className="icons" src={settingsButton}></img></button>
                    <button className="right-action"><img className="icons" src={createButton}></img></button>
                    <h2>Messenger</h2>
                </div>
                <div className="content">
                  <h2>{_.get(activeChannel,"title")}</h2>
                </div>
                <div className="right">
                  <div className="user-bar">
                    <div className="profile-name">Milan</div>
                    <div className="profile-image"><img src={avatar} alt="Profile Pic"></img></div>
                  </div>
                </div>
            </div>

{/* ----------------------MAIN CONTENT-------------------------------------------------------------------------------------------------------------------------------- */}

            <div className="main-content">

                <div className="sidebar-left">
                  <div className="channels">

                    {channels.map((channel) => {
                      return(
                        <div onClick={() => 
                          {store.setActiveChannelId(channel._id)}} 
                          key={channel._id} 
                          className={classNames("channel",{"active":_.get(activeChannel,"_id") === _.get(channel,"_id",null)})}>

                          <div className="channel-image">
                            <img src={avatar} alt="channel-image"></img>
                          </div>
                          <div className="channel-info">
                              <h2>{channel.title}</h2>
                              <p>{channel.lastMessage}</p>
                          </div>
                        </div>
                      )
                    })}

                  </div>
                </div>
                <div className="content">
                  <div ref={(ref) => this.messageRef = ref} className="messages">
                    {messages.map((message) => {
                      return (
                        <div key={message._id} className={classNames("message",{"me": message.me})}>
                          <div className="message-user-image"><img src={message.avatar} alt="message-sender-image"></img></div>
                          <div className="message-body">
                              <div className="message-author">{message.me ? "You" : message.author}</div>
                              <div className="message-text">
                                {this.renderMessage(message)}
                              </div>
                          </div>
                        </div>
                      ) 
                    })}
                  </div>
                  <div className="messenger-input">
                    <div className="text-input">
                      <textarea 
                        onKeyUp={(e) => {
                          if(e.key === "Enter" && !e.shiftKey){
                            this.handleSend()
                          }
                        }} 
                        value={this.state.newMessage} 
                        onChange={(e)=>this.setState({newMessage:e.target.value})} 
                        placeholder="Write your message"/>
                    </div>
                    <div className="actions">
                      <button onClick={this.handleSend} className="send">Send</button>
                    </div>
                  </div>
                </div>


                <div className="sidebar-right">
                  <div className="members">
                  <label>Members</label>
                  {members.map((member,key) => {
                    return(
                      <div key={key} className="member">
                        <div className="member-image">
                            <img src={avatar} alt="member-image"></img>
                        </div>
                        <div className="member-info">
                            <h2>{member.name}</h2>
                            <p>{`Joined: ${member.created}`}</p>
                        </div>
                      </div>
                    )
                  })}

                  </div>
                </div>

            </div>
      </div>
    )
  };
};

export default Messenger;
