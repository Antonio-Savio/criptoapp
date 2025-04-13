import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CoinProps } from '../home'
import styles from './detail.module.css'
import { AiOutlineLoading } from "react-icons/ai";

interface ResponseData{
  data: CoinProps;
}

interface ErrorData{
  error: string;
}

type DataProps = ResponseData | ErrorData;

export function Detail() {
  const {cripto} = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState<CoinProps>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getCoin(){
      try{
        fetch(`https://rest.coincap.io/v3/assets/${cripto}?apiKey=${import.meta.env.VITE_API_KEY}`)
        .then(response => response.json())
        .then((data: DataProps) => {
          if ("error" in data){
            navigate('/')
            return
          }

          const price = Intl.NumberFormat("en-US", {
            style: 'currency',
            currency: 'USD'
          })
    
          const priceCompact = Intl.NumberFormat("en-US", {
            style: 'currency',
            currency: 'USD',
            notation: 'compact'
          })

          const coinData = data.data

          const resultData = {
            ...coinData,
            formatedPrice: price.format(Number(coinData.priceUsd)),
            formatedMarket: priceCompact.format(Number(coinData.marketCapUsd)),
            formatedVolume: priceCompact.format(Number(coinData.volumeUsd24Hr))
          }

          setCoin(resultData);
          setLoading(false)
        })

      } catch(err){
        console.log(err);
        navigate('/')
      }
    }

    getCoin()
  }, [cripto])

  if (loading || !coin){
    return(
      <div className={styles.container}>
        <h4>Carregando detalhes <AiOutlineLoading className={styles.loader} /></h4>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{coin?.name} | {coin?.symbol}</h1>

      <section className={styles.content}>
        <img
          src={`https://assets.coincap.io/assets/icons/${coin?.symbol.toLowerCase()}@2x.png`} 
          alt="Logo criptomoeda"
          className={styles.logo}
        />

        <p><strong>Preço: </strong>{coin?.formatedPrice}</p>
        <p><strong>Valor de mercado: </strong>{coin?.formatedMarket}</p>
        <p><strong>Volume: </strong>{coin?.formatedVolume}</p>
        <p>
          <strong>Mudança 24h: </strong>
          <span className={Number(coin?.changePercent24Hr) > 0 ? styles.profit : styles.loss}>
            {Number(coin?.changePercent24Hr).toFixed(2)}
          </span>
        </p>
      </section>
    </div>
  )
}