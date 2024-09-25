import { useState, useEffect, FormEvent } from 'react';
import styles from './home.module.css'
import { IoIosSearch } from "react-icons/io";
import { Link , useNavigate} from 'react-router-dom'
import { AiOutlineLoading } from "react-icons/ai";

export interface CoinProps{
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  vwap24Hr: string;
  changePercent24Hr: string;
  rank: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  explorer: string;
  formatedPrice: string;
  formatedMarket: string;
  formatedVolume: string;
}

interface DataProp{
  data: CoinProps[];
  timestamp: number;
}

export function Home() {
  const [input, setInput] = useState("")
  const [coins, setCoins] = useState<CoinProps[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate();

  useEffect(() => {
    getData()
  }, [offset, setCoins])

  async function getData(){
    fetch(`https://api.coincap.io/v2/assets?limit=10&offset=${offset}`)
    .then(response => response.json())
    .then((data: DataProp) => {
      const CoinsData = data.data;

      const price = Intl.NumberFormat("en-US", {
        style: 'currency',
        currency: 'USD'
      })

      const priceCompact = Intl.NumberFormat("en-US", {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      })

      const formatedResult = CoinsData.map((item) => {
        const formated = {
          ...item,
          formatedPrice: price.format(Number(item.priceUsd)),
          formatedMarket: priceCompact.format(Number(item.marketCapUsd)),
          formatedVolume: priceCompact.format(Number(item.volumeUsd24Hr))
        }

        return formated
      })

      const listCoins = [...coins, ...formatedResult]
      setCoins(listCoins)
      setLoading(false)

    })
  }

  function handleSubmit(e: FormEvent){
    e.preventDefault();

    if (input === "") return;

    navigate(`detail/${input.toLocaleLowerCase()}`)
  }

  function handleGetMore(){
    if (offset === 0){
      setOffset(10)
      return;
    }

    setOffset(offset + 10)
  }

  function sortByParam(param: string){
    let sortedCryptos: CoinProps[] = []
    
    switch(param){
      case ("marketCapUsd"):
        sortedCryptos = [...coins].sort((a, b) => parseFloat(b.marketCapUsd) - parseFloat(a.marketCapUsd));
        break
      case ("priceUsd"):
        sortedCryptos = [...coins].sort((a, b) => parseFloat(b.priceUsd) - parseFloat(a.priceUsd));
        break
      case ("volumeUsd24Hr"):
        sortedCryptos = [...coins].sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr));
        break
      case ("changePercent24Hr"):
        sortedCryptos = [...coins].sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr));
        break
    }

    setCoins(sortedCryptos);
  }

  if (loading || !coins){
    return(
      <div className={styles.container}>
        <h4>Carregando... <AiOutlineLoading className={styles.loader} /></h4>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder='Digite o nome da moeda... Ex: Bitcoin'
          value={input}
          onChange={ e => setInput(e.target.value)}
        />

        <button type='submit'>
          <IoIosSearch size={30} color='#fff' />
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th scope='col'>Moeda</th>
            <th scope='col' onClick={() => sortByParam("marketCapUsd")} style={{cursor: 'pointer'}}>Valor mercado</th>
            <th scope='col' onClick={() => sortByParam("priceUsd")} style={{cursor: 'pointer'}}>Preço</th>
            <th scope='col' onClick={() => sortByParam("volumeUsd24Hr")} style={{cursor: 'pointer'}}>Volume</th>
            <th scope='col' onClick={() => sortByParam("changePercent24Hr")} style={{cursor: 'pointer'}}>Mudança 24h</th>
          </tr>
        </thead>

        <tbody id='tbody'>
          {coins.length > 0 && coins.map((item) => (
            <tr className={styles.tr} key={item.id}>

              <td className={styles.tdLabel} data-label="Moeda">
                <div className={styles.name}>
                  <img
                    className={styles.logo}
                    src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`}
                    alt="Logo criptomoeda"
                  />

                  <Link to={`/detail/${item.id}`}>
                    <span>{item.name}</span> | {item.symbol}
                  </Link>
                </div>
              </td>

              <td className={styles.tdLabel} data-label="Valor mercado">
                {item.formatedMarket}
              </td>

              <td className={styles.tdLabel} data-label="Preço">
                {item.formatedPrice}
              </td>

              <td className={styles.tdLabel} data-label="Volume">
                {item.formatedVolume}
              </td>

              <td className={Number(item.changePercent24Hr) > 0 ? styles.tdProfit : styles.tdLoss} data-label="Mudança 24h">
                <span>{Number(item.changePercent24Hr).toFixed(2)}</span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.buttonMore} onClick={handleGetMore}>
        Carregar mais
      </button>
    </main>

  )
}
