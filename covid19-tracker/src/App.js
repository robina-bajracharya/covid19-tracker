import React, { useState,useEffect } from 'react';
import './App.css';
import { FormControl,Select,MenuItem ,Card,CardContent} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData,prettyPrintStat} from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries,setCountries]= useState([]);
  const [country,setCountry]= useState('worldwide');
  const [countryInfo,setCountryInfo]= useState({});
  const [tableData,setTableData]= useState([]);
  const [mapCenter,setMapCenter]=useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom,setMapZoom]=useState(3);
  const [mapCountry,setMapCountry]=useState([]);
  const [casesType,setCasesType]=useState('cases');
  useEffect (()=>{
    fetch("https://disease.sh/v3/covid-19/all").
    then(response=>response.json()).
    then(data =>{
      setCountryInfo(data);
    });
  },[]);
  useEffect(()=>{
    const getCountryData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries").then((response)=>response.json()).then((data) => {
        const countries = data.map((country)=>(
          {
            name:country.country,
            value:country.countryInfo.iso2
          }
        ));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountry(data);
        setCountries(countries);
      });
    };
    getCountryData();
  },[]);

  const onCountryChange = async(event)=>{
    const countryCode = event.target.value;
    const url = countryCode ==='worldwide'? "https://disease.sh/v3/covid-19/all" : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) =>response.json())
      .then ((data) =>{
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
        setMapZoom(4);
      });    
    };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {
                countries.map((country)=>(
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className ="app__stats">
          <InfoBox isRed active={casesType === "cases"} onClick={(e) => setCasesType("cases")} title="Corona Virus cases" cases={prettyPrintStat(countryInfo.todayCases)} total ={prettyPrintStat(countryInfo.cases)} />
          <InfoBox active={casesType === "recovered"} onClick={(e) => setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox isRed active={casesType === "deaths"} onClick={(e) => setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        <Map casesType ={casesType} countries ={mapCountry} center={mapCenter} zoom={mapZoom} /> 
        <div className="app__footer">made with &hearts; by Robina</div>
      </div>
      <Card className="app__right">
        <CardContent>
          <h2>Live Cases by country</h2>
          <Table countries={tableData}/>

        </CardContent>
        <CardContent>
          <h2 className="app__graphtitle">Worldwide new {casesType}</h2>
          <LineGraph  className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
      
    </div>
    

  );
}

export default App;
