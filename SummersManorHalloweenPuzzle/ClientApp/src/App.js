import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import EditRiddleData from './components/EditRiddleData';

import './custom.css';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editriddledata" element={<EditRiddleData />} />
      </Routes>
    </Layout>
  );
}
