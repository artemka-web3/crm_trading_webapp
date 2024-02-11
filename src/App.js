import {React, useState, useEffect} from "react";
import './App.css'
import axios from 'axios';

let tg = window.Telegram.WebApp; 
tg.expand();

function App() {

    const [chats, setChats] = useState({})
    const [users, setUsers] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [curUser, setCurUser] = useState([])
    const [currentChatId, setCurrentChatId] = useState(0)

    const [image, setImage] = useState('')
    const [first, setFirst] = useState('')
    const [last, setLast] = useState('')
    const [uname, setUname] = useState('')

    const [inputMsg, setInputMsg] = useState('')


    const handleSearch = (e) => {
      let term = e.target.value;
      setSearchTerm(term);

      let filtered = [];
      if(users){
      // Filter users based on the search term
        filtered = users.filter(user => (
          (user.username && user.username.toLowerCase().includes(term.toLowerCase()))
        ));
      }
      setFilteredUsers(filtered);
    };

    const [loading, setLoading] = useState(true);

    const handleInput = (e) => {
        setInputMsg(e.target.value);
    }

    const sendMessage = async() => {
        axios.post('http://134.0.118.29/api/send-telegram-message/', {
            chat_id: currentChatId,
            message: inputMsg,
          })
          .then(response => {
            console.log('Message sent successfully:', response.data);
          })
          .catch(error => {
            console.error('Error sending message:', error);
          });
        await createChatMessage();
        setInputMsg('')
        
    }

    const createChatMessage = async () => {
        const createMsgReq = 'http://134.0.118.29/api/messages/create/';
      
        const newMessageData = {
          user: currentChatId,
          message_id: chatMessages.length,
          message_text: inputMsg,
          message_datetime: formatDateToISOString(new Date()),
          message_sender: 'bot',
        };
      
        try {
          const response = await axios.post(createMsgReq, newMessageData);
          console.log(response.data);
          return response.status;
        } catch (error) {
          console.error('Error creating chat message:', error);
          return 500; // Return a custom status code or handle the error as needed
        }
      };
          
       
    function formatDateToISOString(date) {
        // Get individual components of the date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
      
        // Construct the formatted string
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}Z`;
      
        return formattedDate;
    }
    
    
    function formatDate(inputDate) {
        // Создаем объект даты из переданного аргумента
        let currentDate = new Date(inputDate);
        
        // Извлекаем нужные компоненты даты
        let hours = currentDate.getHours() - 3;
        let minutes = currentDate.getMinutes();
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
        let year = currentDate.getFullYear();
      
        // Добавляем ведущий ноль, если значение часов или минут меньше 10
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
      
        // Форматируем строку в желаемом формате
        let formattedDate = hours + ":" + minutes + ", " + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day + "-" + year;
      
        return formattedDate;
    }
      
      
      
      
      

    
    const chooseChat = async (e, id) => {
        e.preventDefault();
        setCurrentChatId(id);
    
        // Set all messages in this chat as read in the frontend
        const filteredUser = users.filter(user => user.tg_id === `${id}`);
        setCurUser(filteredUser);
    
        // Make an API call to mark messages as read in the backend
        try {

            // Set the CSRF token in the axios headers
            axios.defaults.headers.common['X-CSRFToken'] = 'AI30dxro2AAoESxKDUg4Rz19WSiLmWdC';
            const apiUrl = `http://134.0.118.29/api/read_all/?tg_id=${id}`;
            await axios.post(apiUrl);
    
            
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };
    

    useEffect(() => {
        

        const getUsers = async () => {
            let usersarr = []
            const apiUrl = 'http://134.0.118.29/api/users/';
            
            try {
              const response = await axios.get(apiUrl);
              const sortedUsers = response.data;
              usersarr = sortedUsers;
              console.log('sortedUsers', sortedUsers)
              setUsers(usersarr);
              setFilteredUsers(usersarr);
              return response.data;
            } catch (error) {
              console.error('Error:', error);
              throw error;
            }
          };

        const defaultChatMessages = async() => {
            const apiUrl = `http://134.0.118.29/api/messages/?chat_id=${currentChatId}`;
            axios.get(apiUrl)
              .then(response => {
                console.log('defaultChatMessages', response.data);
                setChatMessages(response.data);
              })
              .catch(error => {
                console.error('Error:', error);
            }); 
        }

        const defaultUser = async () => {
            const filteredUser = users.filter(user => user.tg_id == currentChatId);
            if (filteredUser[0]) {
                setFirst(filteredUser[0].first_name)
                setLast(filteredUser[0].last_name)
                setImage(filteredUser[0].image)
                setUname(filteredUser[0].username)
            }
            



            console.log("default user: ",  filteredUser);
        }

        const fetchData = async () => {
            await getUsers();
            await defaultChatMessages();
            await defaultUser();
            
        };
        
        // Cleanup function to clear the interval when the component unmounts
        const intervalId = setInterval(() => {
            fetchData();

          }, 3000);
      
          // Clean up the interval on component unmount
          return () => clearInterval(intervalId);
    }, [users, currentChatId, chats, chatMessages, curUser]);


        return (
            <div className="container-fluid h-100">
                <div className="row justify-content-center h-100">
                    <div className="col-md-4 col-xl-3 chat"><div className="card mb-sm-3 mb-md-0 contacts_card">
                        <div className="card-header">
                            <div className="input-group">
                            <input value={searchTerm} onChange={handleSearch} type="text" placeholder="Search by tg username..." name="" className="form-control search"/>
                                <div className="input-group-prepend">
                                    <span className="input-group-text search_btn"><i className="fas fa-search"></i></span>
                                </div>
                            </div>
                        </div>
                        <div className="card-body contacts_body">
                            <ui className="contacts">
                                {filteredUsers.map(user => (
                                    <li key={user.tg_id} className="active">
                                        <div className="d-flex bd-highlight">
                                            <div className="img_cont">
                                                <img className="rounded-circle" height="75px" width = "75px" src={`${user.image}`}/>
                                                {parseInt(user.unread_messages_count) > 0 && (
                                                    <div className="unread-messages-badge">{user.unread_messages_count}</div>
                                                )}
                                            </div>
                                            <div className="user_info">
                                                <span>{user.first_name + ' ' + user.last_name}</span>
                                                <p>{`@${user.username}`}</p>
                                                <button onClick={(e)=>chooseChat(e, user.tg_id)} className="btn-primary">Open Chat</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                
                                
                            </ui>
                        </div>
                        <div className="card-footer"></div>
                    </div></div>
                    <div className="col-md-8 col-xl-6 chat">
                        <div className="card">
                            <div className="card-header msg_head">
                                <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                        <img className="rounded-circle" height="75px" width = "75px" src={image ? `${image}` : "https://cdn-icons-png.flaticon.com/512/25/25333.png"}/>
    
                                        {/* {users.filter(user => user.tg_id == currentChatId) == [] ? (<img className="rounded-circle" height="75px" width = "75px"/>) : (<img className="rounded-circle" height="75px" width = "75px" src={`${users.filter(user => user.tg_id == currentChatId)[0].image}`}/>)} */}
                                        {/* <img className="rounded-circle" height="75px" width = "75px" src={`${curUser.image}`}/> */}
                                    
                                    </div>
                                    <div className="user_info">
                                    <span>Chat with {first || last ? first + " " + last : "?"}</span>
                                        {/* {users.filter(user => user.tg_id == currentChatId) == [] ? (
                                            <span>Undefined</span>
                                        ) : (<span>Chat with {users.filter(user => user.tg_id == currentChatId)[0].first_name + " " + users.filter(user => user.tg_id == currentChatId)[0].last_name}</span>)} */}
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="card-body msg_card_body">
                                {chatMessages.map(message => (
                                    <div key={message.id} className={message.message_sender == "user" ? "d-flex justify-content-start mb-4" : "d-flex justify-content-end mb-4"}>
                                        {message.message_sender == "user" ? <img src={image} class="rounded-circle user_img_msg"/> :  ""}
                                        <div className={message.message_sender == "user" ? "msg_cotainer" : "msg_cotainer_send"}>
                                            <div ><b>DATE: </b>{formatDate(message.message_datetime)}</div>
                                            <div><b>MESSAGE: </b>{message.message_text}</div>
                                        </div>
                                        {message.message_sender == "bot" ? <img src="https://e7.pngegg.com/pngimages/498/917/png-clipart-computer-icons-desktop-chatbot-icon-blue-angle-thumbnail.png" class="rounded-circle img_cont_msg"/> :  ""}


                                    </div>
                                ))}
                                
                                
                            </div>
                            <div className="card-footer">
                                <div className="input-group">
                                    <div className="input-group-append">
                                        <span className="input-group-text attach_btn"><i className="fas fa-paperclip"></i></span>
                                    </div>
                                    <textarea name="" className="form-control type_msg" onChange={handleInput} placeholder="Type your message..."></textarea>
                                    <div className="input-group-append">
                                        <button onClick={() => sendMessage()}><span className="input-group-text send_btn"><i className="fas fa-location-arrow"></i></span></button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }                               

export default App;
