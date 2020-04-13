import React,{Component} from 'react';
import "./messenger.scss";
import classNames from "classnames";
import avatar from "../images/avatar.png";
import {OrderedMap} from "immutable";
import _ from "lodash";
import {ObjectId} from "../../helpers/objectId"; 
import settingsButton from "../../icons/settings.svg";
import createButton from "../../icons/create.svg";
import moment from "moment";

import SearchUser from "../searchUser/searchUser";
import UserBar from "../userBar/userBar";

class Messenger extends Component {
  constructor(props){
    super(props);
    this.state = {
      height:window.innerHeight,
      newMessage:"",
      searchUser:"",
      showSearchUser:false,
    }

    this._onResize = this._onResize.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.scrollMessageToBottom = this.scrollMessageToBottom.bind(this);
    this._onCreateChannel = this._onCreateChannel.bind(this);
    this.renderChannelTitle = this.renderChannelTitle.bind(this);
  }

  _onCreateChannel(){
    const {store} = this.props;
    const channelId = new ObjectId().toString();

    const currentUser = store.getCurrentUser();
    const currentUserId = _.get(currentUser,"_id");

    const channel = {
      _id:channelId,
      title:"",
      lastMessage:"",
      members:new OrderedMap(),
      messages:new OrderedMap(),
      created:new Date(),
      userId:currentUserId,
      isNew:true,
    }

     channel.members = channel.members.set(currentUserId,true);
    store.onCreateNewChannel(channel);
    
  }

  renderChannelTitle(channel){
    const {store} = this.props;
    const members = store.getMembersFromChannel(channel);
    const names = [];

    members.forEach(user => {
      const name = _.get(user,"name");
      names.push(_.get(user,"name"));
    })

    let title = _.join(names,",");
    if(!title && _.get(channel,"isNew")){
      title = "New Message";
    };


    return <h2>{title}</h2>
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
        userId:_.get(currentUser,"_id"),
        me:true,
      }
      store.addMessage(messageId,message)
      this.setState({newMessage:""})
    }
  }

  _onResize(){
    this.setState({height:window.innerHeight})
  }

  scrollMessageToBottom(){
    if(this.messageRef){
      this.messageRef.scrollTop = this.messageRef.scrollHeight;
    }
  }

  componentDidMount(){
    window.addEventListener("resize",this._onResize);
  }

  componentDidUpdate(){
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
                    <button onClick={this._onCreateChannel} className="right-action"><img className="icons" src={createButton}></img></button>
                    <h2>Messenger</h2>
                </div>

                <div className="content">

                  {_.get(activeChannel,"isNew") ? 
                  
                    <div className="toolbar">
                      <label>To:</label>
                      {
                        members.map(user => {
                          return (
                            <span onClick={()=>{
                              store.removeMemberFromChannel(activeChannel,user);
                            }} 
                            key={_.get(user,"_id")}>
                              {_.get(user,"name")}
                            </span>
                          )
                        })
                      }
                      <input type="text" placeholder=" Type name of person"
                        onChange={(e)=>
                          {this.setState({
                            searchUser:e.target.value,
                            showSearchUser:true
                          })}
                        }
                        value={this.state.searchUser}>
                      </input>

                      {this.state.showSearchUser ? <SearchUser 
                          onSelect={(user) => {
                          this.setState({
                            showSearchUser:false,
                            searchUser:"",
                          }, () => {
                            const userId = _.get(user,"_id");
                            const channelId = _.get(activeChannel,"_id");
                            store.addUserToChannel(channelId,userId);
                          })
                        }}
                        search={this.state.searchUser}
                        store={store}
                      />
                      :
                      null
                      }

                    </div>

                    :

                    <h2>{this.renderChannelTitle(activeChannel)}</h2> }

                </div>

                <div className="right">
                  <UserBar store={store} />
                </div>
            </div>

{/* ----------------------MAIN CONTENT-------------------------------------------------------------------------------------------------------------------------------- */}

            <div className="main-content">
{/* ----------------------SIDEBAR-LEFT------------------------------------------------------- */}
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
                              {this.renderChannelTitle(channel)}
                              <p>{channel.lastMessage}</p>
                          </div>
                        </div>
                      )
                    })}

                  </div>
                </div>

{/* ----------------------CONTENT------------------------------------------------------- */}     

                <div className="content">
                  <div ref={(ref) => this.messageRef = ref} className="messages">
                    {messages.map((message) => {
                      const user = _.get(message,"user")
                      return (
                        <div key={message._id} className={classNames("message",{"me": message.me})}>
                          <div className="message-user-image"><img src={user.avatar} alt="message-sender-image"></img></div>
                          <div className="message-body">
                              <div className="message-author">{message.me ? "You" : user.name}</div>
                              <div className="message-text">
                                {this.renderMessage(message)}
                              </div>
                          </div>
                        </div>
                      ) 
                    })}
                  </div>

                  {activeChannel && members.size > 0 ? 
                  
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

                  :

                  null

                  }
                </div>

{/* ----------------------SIDEBAR-RIGHT------------------------------------------------------- */}

                <div className="sidebar-right">
                  {members.size > 0 ?
                    <div className="members">
                    <label>Members</label>
                      {members.map((member,key) => {
                        return(
                          <div key={key} className="member">
                            <div className="member-image">
                                <img src={member.avatar} alt="member-image"></img>
                            </div>
                            <div className="member-info">
                                <h2>{member.name}</h2>
                                <p>Joined: {moment(member.created).fromNow()}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  : null
                  }
                </div>

            </div>
      </div>
    )
  };
};

export default Messenger;
