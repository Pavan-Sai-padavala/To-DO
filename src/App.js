import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    const todoCollection = collection(db, 'todos');
    onSnapshot(todoCollection, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({id: doc.id, todo: doc.data().todo, completed: doc.data().completed})))
    });
  }, []);

  const addTodo = async (event) => {
    event.preventDefault();
    const todosCollection = collection(db, 'todos');
    if (editId) {
      const todoDoc = doc(db, 'todos', editId);
      await updateDoc(todoDoc, {
        todo: input,
      });
      setEditId(null);
    } else {
      await addDoc(todosCollection, {
        todo: input,
        completed: false
      });
    }
    setInput('');
  }
  
  const deleteTodo = async (id) => {
    const todoDoc = doc(db, 'todos', id);
    await deleteDoc(todoDoc);
  }
  
  const toggleComplete = async (id, completed) => {
    const todoDoc = doc(db, 'todos', id);
    await updateDoc(todoDoc, {
      completed: !completed
    });
  }
  
  const editTodo = (id, todo) => {
    setEditId(id);
    setInput(todo);
  }
  

  return (
    <div className="App">
      <form>
        <input value={input} onChange={event => setInput(event.target.value)} />
        <button type="submit" onClick={addTodo}>{editId ? 'Update' : 'Add'} Todo</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li style={{ textDecoration: todo.completed ? 'line-through' : '' }}>
            {todo.todo}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            <button onClick={() => toggleComplete(todo.id, todo.completed)}>
              {todo.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </button>
            <button onClick={() => editTodo(todo.id, todo.todo)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
