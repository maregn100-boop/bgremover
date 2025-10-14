import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api' });

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      api.get('/me').then(r => setMe(r.data)).catch(()=> setMe(null));
    }
  }, [token]);

  const login = async () => {
    const email = prompt('email'); const password = prompt('password');
    const r = await api.post('/auth/login', { email, password });
    setToken(r.data.token); localStorage.setItem('token', r.data.token);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + r.data.token;
    const me = (await api.get('/me')).data; setMe(me);
  };

  const register = async () => {
    const name = prompt('name'); const email = prompt('email'); const password = prompt('password');
    await api.post('/auth/register', { name, email, password });
    alert('Registered. Now login.');
  };

  const upload = async () => {
    if (!file) return alert('Choose file');
    const form = new FormData(); form.append('image', file);
    const r = await api.post('/remove-bg', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setResultUrl((process.env.REACT_APP_API_URL || 'http://localhost:4000') + r.data.url);
    setMe((await api.get('/me')).data);
  };

  const pay = async () => {
    const r = await api.post('/pay');
    // redirect to payment URL (mock)
    window.location.href = (process.env.REACT_APP_API_URL || 'http://localhost:4000') + r.data.paymentUrl;
  };

  return (
    <div>
      <h1>Background Remover (Demo)</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="card" style={{ width: 300 }}>
          {me ? (
            <div>
              <p><b>{me.name}</b></p>
              <p>Email: {me.email}</p>
              <p>Trials used: {me.trialsUsed} / 5</p>
              <p>Paid: {me.isPaid ? 'Yes' : 'No'}</p>
              {me.accessExpiresAt && <p>Expires: {new Date(me.accessExpiresAt).toLocaleString()}</p>}
              <button className="btn" onClick={() => { localStorage.removeItem('token'); setToken(''); setMe(null); }}>Logout</button>
            </div>
          ) : (
            <div>
              <button className="btn" onClick={login}>Login</button>
              <button className="btn" style={{ marginLeft: 8 }} onClick={register}>Register</button>
            </div>
          )}
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Upload Image</h3>
          <input type="file" onChange={e=>setFile(e.target.files[0])} />
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={upload}>Remove Background</button>
            <button className="btn" style={{ marginLeft: 8 }} onClick={pay}>Pay 3 ETB (Telebirr)</button>
          </div>
          {resultUrl && (
            <div style={{ marginTop: 12 }}>
              <h4>Result</h4>
              <img src={resultUrl} alt="result" style={{ maxWidth: '100%' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
