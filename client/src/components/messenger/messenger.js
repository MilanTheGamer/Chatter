import React,{Component} from 'react';
import "./messenger.scss";
import classNames from "classnames"
import avatar from "../images/avatar.png"

class Messenger extends Component {
  constructor(props){
    super(props);
    this.state = {
      height:window.innerHeight,
      messages:[],
    }
    this._onResize = this._onResize.bind(this);
  }

  _onResize(){
    this.setState({height:window.innerHeight})
  }

  addTestmessage(){
    let {messages} = this.state;

    for(let i=0; i<100; i++){
      let isMe = false;
      if(i % 2 === 0){
        isMe=true;
      }
      const newMsg = {
        author:`Author: ${i}`,
        message:`Message :${i}`,
        avatar:avatar,
        me: isMe,
      }
      messages.push(newMsg);
      this.setState({messages:messages})
    }
  }

  componentDidMount(){
    window.addEventListener("resize",this._onResize)
    this.addTestmessage()
  }

  componentWillUnmount(){

  }

  render(){

    const {height, messages} = this.state
    const style={
      height:height
    }

    return(
      <div style={style} className="app-messenger">

{/* ----------------------HEADER-------------------------------------------------------------------------------------------------------------------------------- */}
            <div className="header">
                <div className="left">
                  <div className="actions">
                    <button>New Message</button>
                  </div>
                </div>
                <div className="content">
                  <h2>Title</h2>
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

                    <div className="channel">
                      <div className="channel-image">
                        <img src={avatar} alt="channel-image"></img>
                      </div>
                      <div className="channel-info">
                          <h2>Channel Name</h2>
                          <p>Hello there..</p>
                      </div>
                    </div>

                    <div className="channel">
                      <div className="channel-image">
                        <img src={avatar} alt="channel-image"></img>
                      </div>
                      <div className="channel-info">
                          <h2>Channel Name</h2>
                          <p>Hello there..</p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="content">
                  <div className="messages">

                    {messages.map((message,index) => {
                      return (
                        <div key={index} className={classNames("message",{"me": message.me})}>
                          <div className="message-user-image"><img src={message.avatar} alt="message-sender-image"></img></div>
                          <div className="message-body">
                              <div className="message-author">{message.me ? "You" : message.author}</div>
                              <div className="message-text">{message.message}</div>
                          </div>
                        </div>
                      ) 
                    })}

                  </div>
                  <div className="messenger-input">
                    <div className="text-input">
                      <textarea placeholder="Write your message"/>
                    </div>
                    <div className="actions">
                      <button className="send">Send</button>
                    </div>
                  </div>
                </div>

                <div className="sidebar-right">
                  <div className="members">
                  <label>Members</label>
                    <div className="member">
                      <div className="member-image">
                          <img src={avatar} alt="member-image"></img>
                      </div>
                      <div className="member-info">
                          <h2>Member Name</h2>
                          <p>Joined: 3 days ago</p>
                      </div>
                    </div>

                    <div className="member">
                      <div className="member-image">
                          <img src={avatar} alt="member-image"></img>
                      </div>
                      <div className="member-info">
                          <h2>Member Name</h2>
                          <p>Joined: 3 days ago</p>
                      </div>
                    </div>

                  </div>
                </div>

            </div>
      </div>
    )
  };
};

export default Messenger;
