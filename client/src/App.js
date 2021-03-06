import React, { useState, useEffect, Fragment } from 'react';
import dayjs from 'dayjs'
import './app.css'

const App = () => {
  const [items, setitems] = useState([])
  const [recommended, setrecommended] = useState([])
  const [favorites, setfavorites] = useState([])
  const [page, setpage] = useState(0)
  const [recommendedLoading, setrecommendedLoading] = useState(false)
  const [itemsLoading, setitemsLoading] = useState(false)
  const [searchText, setsearchText] = useState('')
  const [isSearch, setisSearch] = useState(false)
  useEffect(async () => {
    fetchItems(0)
    if (localStorage.getItem("favorites") === null) {
      localStorage.setItem("favorites", [])
      setfavorites([])
    } else {
      const favorites = localStorage.getItem("favorites").split(",").filter(f => f !== '')
      setfavorites(favorites)
      fetchRecommended(favorites)
    }
  }, [])

  const fetchItems = async (page, search='', reset=false) => {
    setitemsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/items?pageNum=${page}${search && ('&search=' + search)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      const data = await response.json()
      if (data.success && data.success === true) {
        if (search || reset) {
          setitems(data.movies)
        } else {
          console.log('items', items)
          setitems([...items, ...data.movies])
        }
      }
    } catch (e) {
      console.log(e)
    }
    setitemsLoading(false)
  }

  const fetchRecommended = async (favorites) => {
    setrecommendedLoading(true)
    try {
      const response = await fetch('http://localhost:5000/recommendations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ favorites })
          })
      const data = await response.json()
      if (data.success && data.success === true) {
        console.log(data)
        setrecommended(data.movies)
      }
    } catch (e) {
      console.log(e)
    }
    setrecommendedLoading(false)
  }

  const handleFavorite = (item) => {
    console.log(favorites.includes(item))
    const newFavorites = favorites.includes(item) ? favorites.filter(favorite => favorite !== item) : [...favorites, item]
    console.log(item, newFavorites)
    localStorage.setItem("favorites", newFavorites)
    setfavorites(newFavorites)
    fetchRecommended(newFavorites)
  }

  const handleLoadMore = () => {
    const newPage = page + 1
    setpage(newPage)
    fetchItems(newPage)
  }

  const handleRemoveFavorite = (favorite) => {
    const newFavorites = favorites.filter(f => f !== favorite)
    setfavorites(newFavorites)
    localStorage.setItem("favorites", newFavorites)
    fetchRecommended(newFavorites)
  }

  const handleSearch = () => {
    setitems([])
    fetchItems(0, searchText, true)
  }

  console.log(items)
  return (
    <div >
      <header className="header">
        <h1>Recommendation Engine</h1>
      </header>
      <div className="container">
        {favorites.length > 0 && (
          <div>
            Favorites: {(favorites.map((favorite, i) => (
              <Fragment>
                <span style={{fontWeight: 'bold'}}>{favorite} <button onClick={() => handleRemoveFavorite(favorite)}>x</button> {favorites.length !== i}</span>
              </Fragment>
            )))}
          </div>
        )}
        <div>
          {favorites.length > 0 ? (
            <Fragment>
              <h2 className={recommendedLoading ? 'loading' : 'loaded'}>{recommendedLoading && 'Loading '}Recommended</h2>
              {!recommendedLoading && recommended.map(item => (
                <MovieCard item={item} onFavorite={handleFavorite} isFavorite={favorites.includes(item.title)}/>
                ))}
            </Fragment>
          ) : (
            <h2 style={{color: "red"}}>Favorite any movie to generate recommendations</h2>
          )}
        </div>
        <div>
          <h2 className={itemsLoading ? 'loading' : 'loaded'}>{itemsLoading && 'Loading '}Movies List</h2>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" className="search-box" onChange={(e) => setsearchText(e.target.value)}/>
            <button className="search-btn" onClick={() => handleSearch()}>Search</button>
          </div>
          {items.map(item => (
            <MovieCard item={item} onFavorite={handleFavorite} isFavorite={favorites.includes(item.title)}/>
          ))}
          {items.length >= 10 && !searchText && !itemsLoading && (
            <button className="load-more" onClick={handleLoadMore}>Load More</button>
          )}
          {!itemsLoading && items.length <= 0 && (<p>No items found!</p>)}
        </div>
      </div>
    </div>
  );
}

const MovieCard = ({item, onFavorite, isFavorite}) => {
  const {title, release_date, director} = item
  return (
    <div className="movie-card">
      <h2 className="movie-title">{title} <span style={{fontSize: '0.7em'}}>({dayjs(release_date).format('YYYY')})</span></h2>
      <h3>{director}</h3>
      {onFavorite && (
        <button className={isFavorite ? "unfavorite" : "favorite"} onClick={() => onFavorite(title)}>{isFavorite ? '💔 Remove from favorites' : '❤️ Favorite'}</button>
      )}
    </div>
  )
}

export default App;
