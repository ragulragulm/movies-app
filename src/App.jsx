import React, { use, useEffect, useState } from 'react'
import { Search } from './components/Search'
import { MovieCard } from './components/MovieCard';
import {useDebounce} from 'react-use'
import { updateSearchCount} from './appwrite.js'


//animation in the loading
import { ThreeDots } from 'react-loader-spinner';










const API_BASE_URL ='https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}

 const App = () => {

  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage,setErrorMessage] = useState('')
  const [movieList,setMovieList] = useState([])
  const [isLoading,setIsLoading] = useState(false);
  //const [trendingMovies, setTrendingMovies] = useState([]);
  const [debounceSearchTerm,setdebounceSearchTerm] = useState('')

  useDebounce(() => setdebounceSearchTerm(searchTerm), 500 , [searchTerm])





  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')
    try{
      const endpoint = query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS)
    
      if (!response.ok) {
      const errorData = await response.json();
      console.error("TMDB Error Response:", errorData);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched Movies:", data.results);
    

    if(data.response === 'false') {
      setErrorMessage(data.error || 'failed to fetch movies')
      setMovieList([])
      return;
    }
    setMovieList(data.results || [])
    
if (query && data.results.length > 0) {
  await updateSearchCount(query, data.results[0])
}

    if(query && data.results.length > 0) {
     
      await updateSearchCount(query, data.results[0])
    }

    }catch(error){
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.')
    } finally{
      setIsLoading(false)
    }
 }

/*
const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    }catch(error){
      console.error(`Error fetching trending movies: ${error}`)
    }
}

useEffect(() => {
  loadTrendingMovies();
},[])
*/

  useEffect(() => {
    fetchMovies(debounceSearchTerm)
  },[debounceSearchTerm])
  

  return (
    <main>
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src='./hero.png' alt='hero Banner'/>
          <h1>Find <span className='text-gradient'>Movies</span> you'll Enjoy without the hassle</h1>
        
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
          
        <section className='all-movies'>
            <h2 className='mt-[40px]'>All Movies</h2>
            {isLoading?(
              //<p className='text-white'>loading...</p> 
                <ThreeDots 
                  height="80" 
                  width="80" 
                  radius="9"
                  color="#840ad6ff" 
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
            ): errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
            ):(
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
        </section>
      </div>
    </main>
  )
}


export default App