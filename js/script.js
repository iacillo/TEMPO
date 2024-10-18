
const key = 'f065fa37f8d245f7b35221028240810'

async function getLocalizacao(){
    //https://meuip.com/api/meuip.php

    const base = `https://ip-api.com/json/`
    //const base = `https://ipapi.co/json/`;
    const response = await fetch(base)
    const dados = await response.json()
    const {ok} = response
    const {error} = dados
    if (ok && !error) {
        const {city, region, countryCode, lat, lon} = dados
        const local = {cidade:city, estado:region,pais:countryCode,lat:lat,lon:lon}
        return local
        //atualizarCidade(local)
    }else{
        return{erro:"Erro ao acessar localização"}
    }
}


async function getCidades(uf) {
    //{}
    const base = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    const response = await fetch(base)
    const dados = await response.json()
    const {ok} = response
    const {erro} = dados
    if (ok && !erro) {
        const cidades = dados.map(cidade => cidade.nome)
        return cidades
    }else{
        return ["Erro ao acessar cidades"]
    }
}
async function getUFs() {
    //{}
    const base = `https://servicodados.ibge.gov.br/api/v1/localidades/estados`
    const response = await fetch(base)
    const dados = await response.json()
    const {ok} = response
    const {erro} = dados
    if (ok && !erro) {
        const estados = dados.map(estado => {return {sigla:estado.sigla, nome:estado.nome}})
        return estados
    }else{
        return ["Erro ao acessar estados"]
    }
}

function removerAcentos(texto){
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}


async function getTempo(key,cidade) {
    const base = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${cidade}&lang=pt`
    const base_sem_acentos = removerAcentos(base)
    const response = await fetch(base_sem_acentos)
    const dados = await response.json()
    const {ok} = response
    const {error} = dados
    
    if(error || !ok){
        return {erro:error.message,response:ok}
    }else{
        const {text:condicao, icon} = dados.current.condition
        const {temp_c:temperatura, humidity:umidade, last_updated:atualizacao} = dados.current
        const tempo = {condicao:condicao,icone:icon,temperatura:temperatura,umidade:umidade,atualizacao:atualizacao}
        return tempo
        //atualizarDisplay(condicao,icon,temperatura,umidade,atualizacao)
    }
    
}
async function atualizarCidade({cidade,estado}){
    document.querySelector("#estado").value = estado
    document.querySelector("#cidade").value = cidade

}
function atualizarDisplay({condicao,icone,temperatura,umidade,atualizacao}){
    document.querySelector("#condicao").innerHTML = condicao
    document.querySelector("#icone").src=`https://${icone}`;
    document.querySelector("#temperatura").innerHTML = temperatura + "<sup>°c</sup>"
    document.querySelector("#umidade").innerHTML = umidade + " %"
    document.querySelector("#atualizacao").innerHTML = atualizacao
}
async function carregarEstados() {
    const estados = await getUFs()
    const options = estados.map(
        estado => `<option value="${estado.sigla}">${estado.nome}</option>`
    )
    document.querySelector("#estado").innerHTML = options.join("")
}
async function carregarCidades(uf) {
    const cidades = await getCidades(uf)
    const options = cidades.map(
        cidade => `<option value="${cidade}">${cidade}</option>`
    )
    document.querySelector("#cidade").innerHTML = options.join("")
}

function carregando(flag){
    if(flag){
         document.querySelector(".carregando").style.cssText="display: flex"
         document.querySelector(".container").style.cssText="display: none"
    }else{
        document.querySelector(".carregando").style.cssText="display: none"
         document.querySelector(".container").style.cssText="display: flex"
    }
}

//CARREGAR A PAGINA
window.addEventListener("load",
    async ()=>{
        carregando(true)
        const local = await getLocalizacao()
        await carregarEstados()
        await carregarCidades(local.estado)
        const tempo = await getTempo(key,local.cidade)
        atualizarCidade(local)
        atualizarDisplay(tempo)
        carregando(false)
    }
)
//MUDAR A CIDADE
document.querySelector("#cidade").addEventListener("change",
    async (evt)=>{
        carregando(true)
        const tempo = await getTempo(key,evt.target.value)
        atualizarDisplay(tempo)
        carregando(false)
    }
)
//MUDAR ESTADO
document.querySelector("#estado").addEventListener("change",
    async (evt)=>{
        carregando(true)
        await carregarCidades(evt.target.value)
        const cidade = document.querySelector("#cidade").value
        const tempo = await getTempo(key,cidade)
        atualizarDisplay(tempo)
        carregando(false)
    }
)
