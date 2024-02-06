import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllChats from './components/AllChats';
import SingleChat from './components/SingleChat';




const AppRouter = () => (
 <Router>
    <Routes>
      <Route path="/chats" element={<AllChats/>} />
      <Route path="/chats/:user_id" element={<SingleChat/>} />
    </Routes>
 </Router>
);

export default AppRouter;