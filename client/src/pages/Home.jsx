import React, {Component} from "react";
import './Home.css'
import BgImage from "../backgroundImages/bg2.jpg"
import Stone from "../gameIcons/stones.svg"
import Paper from "../gameIcons/paper.svg"
import Scissors from "../gameIcons/scissors.svg"
// import gameMusic from "../gameMusic.mp3"
import { Link } from "react-router-dom";


export class Home extends Component {

  constructor(props) {
    super(props)
  
    this.state = {
       yourName: "AwesomePlayer"
    }

  }

  componentDidMount(){
  const yourName = JSON.parse(localStorage.getItem('yourName'));
  if (yourName) {
   this.setState({...this.state, yourName: yourName})
   console.log("value retrived from local storage")
  }
}

  componentDidUpdate(prevProps, prevState){
    if(prevState.yourName !== this.state.yourName)
      localStorage.setItem('yourName', JSON.stringify(this.state.yourName))
  }

  render() {
    const {yourName} = this.state
    return <div className="homePage">
    <img className="bgHome" src={BgImage} alt="" />
    <div className="homestoneDiv">
    <img className="homestoneSVG" src={Stone} alt="" />
    <h1>Stone</h1>
    <img className="homescissorsSVG" src={Scissors} alt="" />
    </div>
    <div className="homepaperDiv">
    <img className="homepaperSVG" src={Paper} alt="" />
    <h1>Paper</h1>
    <img className="homestoneSVG" src={Stone} alt="" />
    </div>
    <div className="homescissorsDiv">
    <img className="homescissorsSVG" src={Scissors} alt="" />
    <h1>Scissors</h1>
    <img className="homepaperSVG" src={Paper} alt="" />
    </div>
    <div className="homebuttons">
    <label htmlFor="enterNameInput" id="enterNameInputLabel">Name</label>
    <input type="text" id="enterNameInput" placeholder="Enter Your Name" value={yourName} onChange={(e)=> this.setState({yourName : e.target.value})}
    />
    <Link to={"/gameWithComputer"} state={yourName}><button>Play With Computer</button></Link>
    <Link to={"/gameWithFriend"}><button>Play With Friend</button></Link>
    </div>
  </div>;
  }

}

export default Home;
