import { useNavigate } from "react-router"
import "./WaveMenu.css"
export default function Ondas() {
    const navigate = useNavigate();
    return (
        <ul onClick={()=> navigate("/")} className="wave-menu">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    )
}