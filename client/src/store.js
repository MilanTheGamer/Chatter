import {OrderedMap} from "immutable";
import _ from "lodash";

const users = new OrderedMap({
    "1":{_id:"1", email:"milan@gmail.com", name:"Milan", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@milan.png"},
    "2":{_id:"2", email:"jack@gmail.com", name:"Jack", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@jack.png"},
    "3":{_id:"3", email:"kevin@gmail.com", name:"Kevin", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@kevin.png"},
})

export default class Store{
    constructor(appComponent){
        this.app = appComponent;
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;


        this.user = this.getUserFromLocalStorage();

    }

    getUserFromLocalStorage(){
        let user = null;
        const data = localStorage.getItem("me");
        try{
            user = JSON.parse(data)
        }catch(error){
            console.log(error)
        };
        return user;
    }

    setCurrentUser(user){
        this.user = user;
        if(user){
            localStorage.setItem("me",JSON.stringify(user));
        }
        this.update();
    }

    login(email,password){

        const userEmail = _.toLower(email);
        
        return new Promise((resolve,reject)=>{
            const user = users.find(user => user.email === userEmail);
            if(user){
                this.setCurrentUser(user)
            }
            
            return user ? resolve(user) : reject("User not found")
        })

    }

    signOut(){
        this.user = null;
        localStorage.removeItem("me");
        this.update()
    }

    addUserToChannel(channelId,userId){
        
        const channel = this.channels.get(channelId);
        if(channel){
            channel.members = channel.members.set(userId,true);
            this.channels = this.channels.set(channelId,channel);
            this.update();
        };
    };

    removeMemberFromChannel(channel=null,user=null){

        if(!channel || !user){
            return;
        };

        const userId = _.get(user,"_id");
        const channelId = _.get(channel,"_id");
        channel.members = channel.members.remove(userId);
        
        this.channels = this.channels.set(channelId,channel);
        this.update();
    };

    searchUsers(search=""){
        let searchItems = new OrderedMap();
        
        const keyword = _.toLower(search);
        const currentUser = this.getCurrentUser();
        const currentUserId = _.get(currentUser,"_id");
        if(_.trim(search).length){
            searchItems = users.filter((user) => _.get(user,"_id") !== currentUserId && _.includes(_.toLower(_.get(user,"name")),keyword));
        };

        return searchItems.valueSeq();
    };

    onCreateNewChannel(channel={}){

        const channelId = _.get(channel,"_id");
        this.addChannel(channelId,channel);

        // to set the new channel as the active channel;
        this.setActiveChannelId(channelId);
        this.update();
    }

    getCurrentUser(){
        return this.user;
    }

    getActiveChannel(){
        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
        return channel;
    }

    setActiveChannelId(channeId){
        this.activeChannelId = channeId;
        this.update();
    }

    getMessagesFromChannel(channel){
        let messages = new OrderedMap();

        if(channel){
            channel.messages.forEach((value,key)=>{
                const message = this.messages.get(key);
                messages = messages.set(key,message);
            })
        }
        return messages.valueSeq();
        
    }

    getMembersFromChannel(channel){
        let members = new OrderedMap();

        if(channel){
            channel.members.forEach((value,key)=>{
                const member = users.get(key);
                const loggedUser = this.getCurrentUser();
                if (_.get(loggedUser,"_id") !== _.get(member,"_id")){
                    members = members.set(key,member);
                };
            });
        };

        return members.valueSeq();
    };

    addMessage(id,message={}){
        this.messages = this.messages.set(id,message);
        const user = this.getCurrentUser();
        message.user = user;

        // Add new messageId to current channel.
        const channelId = _.get(message,"channelId");
        if(channelId){
            const channel = this.channels.get(channelId);
            channel.isNew = false;
            channel.lastMessage = _.get(message,"body","");
            channel.messages = channel.messages.set(id,true);
            this.channels = this.channels.set(channelId,channel);
        }
        this.update();
    }

    getMessages(){
        return this.messages.valueSeq();
    }

    addChannel(id,channel={}){
        this.channels = this.channels.set(`${id}`,channel);
        this.update();
    }

    getChannels(){

        // sort channel by date, last one will be listed on top
        this.channels = this.channels.sort((a,b) => a.created < b.created);
        return this.channels.valueSeq();
    }

    update(){
        this.app.forceUpdate();
    }
}