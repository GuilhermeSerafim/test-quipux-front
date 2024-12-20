import { useEffect, useState } from "react";
import PlaylistManager from "../../components/PlaylistManager";
import axios from "axios";

export default function Home() {
    const [loading, setLoading] = useState(true); // Para indicar carregamento
    const [error, setError] = useState(null); // Para tratar erros
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Chamada da API com autenticação via cabeçalho
                const response = await axios.get('http://localhost:8080/lists', {
                    headers: {
                        Authorization: 'Basic ' + btoa('user:27445dd9-616f-457e-8a0c-05725d8ae4f8'),
                    },
                });
                setItems(response.data); // Atualiza os dados no estado
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar os dados.');
            } finally {
                setLoading(false); // Para de exibir o carregamento
            }
        };

        fetchData();
    }, []); // [] para executar apenas uma vez quando o componente for carregado

    console.log(items)
    return (
        <div>
            <h1>Itens da Lista</h1>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.nome}</li>
                ))}
            </ul>
        </div>
    );
}