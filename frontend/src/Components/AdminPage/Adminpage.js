import React, { Component } from 'react';
import './Adminpage.css';

export default class Adminpage extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.imageInput = React.createRef();
    this.trailerInput = React.createRef();
    this.screenshotsInput = React.createRef();
  }

  state = {
    users: [],
    games: [],
    purchasedGames: [],
    newGame: { title: '', description: '', price: '', imageUrl: '', gameFileUrl: '' },
    imageFile: null,
    gameFile: null,
    trailerFile: null,
    screenshotsFiles: [],
    notification: '',
    adminUsername: '',
    isLoading: false,
  };

  componentDidMount() {
    this.checkAdminAccess();
    this.fetchData();
    this.setAdminName();
  }

  checkAdminAccess = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      this.setState({ notification: 'У вас нет прав администратора для доступа к этой странице.' });
      return;
    }
  };

  fetchData = async () => {
    await Promise.all([this.fetchUsers(), this.fetchGames(), this.fetchPurchasedGames()]);
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState((prevState) => ({
      newGame: { ...prevState.newGame, [name]: value },
    }));
  };

  setAdminName = () => {
    const adminUsername = localStorage.getItem('username');
    this.setState({ adminUsername });
  };

  apiCall = async (url, options = {}) => {
    try {
      this.setState({ isLoading: true });
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorMessage = response.statusText;
        
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch (jsonError) {
          console.warn("Ответ не содержит JSON:", jsonError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      this.setState({ notification: error.message });
      console.error(`Ошибка при обращении к API: ${error.message}`);
    } finally {
      this.setState({ isLoading: false });
    }
  };


  fetchUsers = async () => {
    const users = await this.apiCall('http://localhost:5000/api/users');
    if (users) this.setState({ users });
  };

  fetchGames = async () => {
    const games = await this.apiCall('http://localhost:5000/api/games');
    if (games) this.setState({ games });
  };

  fetchPurchasedGames = async () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      this.setState({ notification: 'У вас нет прав администратора для выполнения этого запроса.' });
      return;
    }

    const purchasedGames = await this.apiCall('http://localhost:5000/api/admin/purchased-games', {
      headers: { 'is_admin': 'true' },
    });

    if (purchasedGames && Array.isArray(purchasedGames.games)) {
      this.setState({ purchasedGames: purchasedGames.games });
    } else {
      this.setState({ notification: 'Не удалось загрузить купленные игры. Пожалуйста, попробуйте позже.' });
    }
  };

  handleFileChange = (e, type) => {
    this.setState({ [`${type}File`]: e.target.files[0] });
  };

  handleScreenshotsChange = (e) => {
    this.setState({ screenshotsFiles: Array.from(e.target.files) });
  };

  sendEmailNotifications = async (message) => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
    if (!isAdmin) {
      this.setState({ notification: 'У вас нет прав администратора для выполнения этого запроса.' });
      return;
    }
  
    if (!token) {
      this.setState({ notification: 'Токен не найден, выполните вход.' });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/admin/notify-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message,
          subject: 'Test Subject',
        }),
      });
      
      if (response.ok) {
        this.setState({ notification: 'Уведомление отправлено всем пользователям.' });
      } else {
        const errorData = await response.json();
        this.setState({ notification: `Ошибка: ${errorData.message}` });
      }
    } catch (error) {
      this.setState({ notification: `Ошибка при отправке уведомления: ${error.message}` });
    }
  };
  
  addGame = async () => {
    const { title, description, price } = this.state.newGame;
    const imageFile = this.imageInput.current.files[0];
    const gameFile = this.fileInput.current.files[0];

    if (!title || !description || !price || !imageFile || !gameFile) {
      this.setState({ notification: 'Все поля обязательны для заполнения!' });
      return;
    }

    const formData = new FormData();
    formData.append('gameFile', gameFile);
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);

    const trailerFile = this.trailerInput.current.files[0];
    if (trailerFile) formData.append('trailer', trailerFile);

    Array.from(this.screenshotsInput.current.files).forEach((file) => {
      formData.append('screenshots', file);
    });

    const newGame = await this.apiCall('http://localhost:5000/api/games', { method: 'POST', body: formData });
    if (newGame) {
      this.setState((prevState) => ({
        games: [...prevState.games, newGame],
        newGame: { title: '', description: '', price: '', imageUrl: '', gameFileUrl: '' },
        imageFile: null,
        gameFile: null,
        trailerFile: null,
        screenshotsFiles: [],
        notification: 'Игра успешно добавлена!',
      }));
      await this.sendEmailNotifications(`Новая игра "${title}" была добавлена!`);
    }
  };

  uploadLauncher = async () => {
    const launcherFile = this.fileInput.current.files[0];
  
    if (!launcherFile) {
      this.setState({ notification: 'Пожалуйста, выберите файл для загрузки.' });
      return;
    }
  
    const formData = new FormData();
    formData.append('launcherFile', launcherFile);
  
    const response = await this.apiCall('http://localhost:5000/api/upload-launcher', {
      method: 'POST',
      body: formData,
    });
  
    if (response) {
      this.setState({ notification: 'Лаунчер успешно загружен.' });
    }
  };
  deleteUser(userId) {
    fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Пользователь успешно удален.') {
            alert('Пользователь был удален');
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при удалении пользователя:', error);
        alert('Произошла ошибка при удалении');
    });
  }

  deleteGame = async (gameId) => {
    const result = await this.apiCall(`http://localhost:5000/api/games/${gameId}`, { method: 'DELETE' });
    if (result) {
      this.setState((prevState) => ({
        games: prevState.games.filter((game) => game.id !== gameId),
        notification: 'Игра удалена.',
      }));
    }
  };

  render() {
    const { users, games, purchasedGames, newGame, notification } = this.state;

    return (
      <div className="admin-page">
       
        <nav className="admin-navbar">
          <h1>Добро пожаловать, {this.state.adminUsername}</h1>
          <ul>
            <li>Пользователи</li>
            <li>Игры</li>
            <li>Выход</li>
          </ul>
        </nav>

        <div className="admin-content">
          {notification && <p className="notification">{notification}</p>}

          <h2>Управление пользователями</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
  {Array.isArray(users) && users.length > 0 ? (
    users.map((user) => (
      <tr key={user.user_id}>
        <td>{user.user_id}</td><td>{user.username}</td><td>{user.email}</td>
        <td><button onClick={() => this.deleteUser(user.user_id)}>Удалить</button></td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4">Нет данных</td>
    </tr>
  )}
</tbody>


          </table>

          <h2>Управление играми</h2>
          <div className="add-game-form">
            <input type="text" name="title" value={newGame.title} onChange={this.handleChange} placeholder="Название игры" />
            <input type="text" name="description" value={newGame.description} onChange={this.handleChange} placeholder="Описание игры" />
            <input type="number" name="price" value={newGame.price} onChange={this.handleChange} placeholder="Цена" />
            <input type="file" ref={this.imageInput} onChange={(e) => this.handleFileChange(e, 'image')} />
            <input type="file" ref={this.fileInput} onChange={(e) => this.handleFileChange(e, 'game')} />
            <input type="file" ref={this.trailerInput} onChange={(e) => this.handleFileChange(e, 'trailer')} />
            <input type="file" multiple ref={this.screenshotsInput} onChange={this.handleScreenshotsChange} />
            <button onClick={this.addGame}>Добавить игру</button>
          </div>



          <h2>Загрузка лаунчера</h2>
<div className="add-game-form">
  <input type="file" ref={this.fileInput} onChange={(e) => this.handleFileChange(e, 'launcher')} />
  <button onClick={this.uploadLauncher}>Загрузить лаунчер</button>
  <button onClick={this.downloadLauncher}>Скачать лаунчер</button>
</div>

          <table className="game-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}> {/* Уникальный ключ для каждого элемента */}
                  <td>{game.id}</td>
                  <td>{game.title}</td>
                  <td>{game.price}</td>
                  <td>{game.description}</td>
                  <td>
                    <button onClick={() => this.deleteGame(game.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Купленные игры</h2>
          <table className="purchased-game-table">
            <thead>
              <tr>
                <th>Имя пользователя</th>
                <th>Название игры</th>
              </tr>
            </thead>
            <tbody>
              {purchasedGames.map((purchasedGame) => (
                <tr key={`${purchasedGame.username}-${purchasedGame.game_title}`}> {/* Уникальный ключ для каждого элемента */}
                  <td>{purchasedGame.username}</td>
                  <td>{purchasedGame.game_title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}