import {OrderedMap} from "immutable";
import _ from "lodash";

const users = new OrderedMap({
    "1":{_id:"1", name:"Milan", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@milan.png"},
    "2":{_id:"2", name:"Jack", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@jack.png"},
    "3":{_id:"3", name:"Kevin", created: new Date(), avatar:"https://api.adorable.io/avatars/100/abott@kevin.png"},
})

export default class Store{
    constructor(appComponent){
        this.app = appComponent;
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;


        // Current User
        this.user = {
            _id:"1",
            name:"Milan",
            avatar:"https://api.adorable.io/avatars/100/abott@milan.png",
            created:new Date(),
        }
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
        let messages = [];

        if(channel){
            channel.messages.map((value,key)=>{
                const message = this.messages.get(key);
                messages.push(message)
            });
        }
        return messages;
        
    }

    getMembersFromChannel(channel){
        let members = new OrderedMap();

        if(channel){
            channel.members.map((value,key)=>{
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