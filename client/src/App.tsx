import React from 'react';
import { Route, Switch } from 'wouter';
import EdensHollowGame from './components/games/eden';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Switch>
        <Route path="/" component={EdensHollowGame} />
      </Switch>
    </div>
  );
};

export default App;