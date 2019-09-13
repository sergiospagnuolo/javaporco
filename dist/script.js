//margens 
var margin = { top: 20, right: 50, bottom: 40, left: 30 };

//var widther = window.outerWidth / 2.2;

var widther = 600;

var width = widther - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

//faz o parseamento das datas para formato adequado
var parseDate = d3.time.format("%Y-%m-%d").parse;

//divide a data para localizar melhor as tooltips
var bisectDate = d3.bisector(function(d) {
  return d.data;
}).left;

//cria o svg para o container do gráfico no html
var svg = d3
  .select(".g-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//cria a xScale
var xScale = d3.time.scale().range([0, width]);

//cria a yScale
var yScale = d3.scale.linear().range([height, 0]);

//estilos do eixo x
var yAxis = d3.svg
  .axis()
  .scale(yScale)
  .tickSize(-width)
  .tickPadding(8)
  .orient("left");

//estilos do eixo x
var xAxis = d3.svg
  .axis()
  .scale(xScale)
  .tickPadding(20)
  .orient("bottom")
  .tickSize(height)
  .ticks(numTicks(width))
  .tickFormat(d3.time.format("%d/%m/%Y"));

//convenção para a função de linha
var line = d3.svg
  .line()
  .x(function(d) {
    return xScale(d.data);
  })
  .y(function(d) {
    return yScale(d.tempo);
  });

//carrega os dados
var csv =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTWt2b9ES-HFsYooZd5pt73wf3tH6NNVjKf-sW0ksLgKF6p-QpGwbB2Pi-UVsWCxMLbKPsmBwUvVJG/pub?gid=0&single=true&output=csv";

d3.csv(csv, ready);

function ready(err, data) {
  if (err) throw "erro no carregamento dos dados";
  console.log("Olá!");

  //formata os dados
  data.forEach(function(d) {
    d.tempo = +d.tempo;
    d.episodio = d.episodio;
    d.datalabel = d.datalabel;
    d.data = parseDate(d.data);
  });

  console.log(data);

  //adiciona o título
  d3.select(".g-hed").text("Observatório Javaporco");

  //adiciona a linha fina
  d3
    .select(".g-intro")
    .html(
      "Saiba quanto tempo dura cada episódio do podcast <a href='https://piaui.folha.uol.com.br/radio-piaui/foro-de-teresina/' target='_blank'>Foro de Teresina</a>."
    );

  data.sort(function(a, b) {
    return a.data - b.data;
  });

  //define escala máxima para x
  xScale.domain(
    d3.extent(data, function(d) {
      return d.data;
    })
  );

  //define escala máxima para y
  yScale.domain(
    d3.extent(data, function(d) {
      return d.tempo;
    })
  );

  //cria o Eixo y
  var yAxisGroup = svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  //cria o Eixo x
  var xAxisGroup = svg
    .append("g")
    .attr("class", "x axis")
    .call(xAxis);
 

  //liga dos dados ao desenho da linha
  var drawline = svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
  
  //tooltips
  var focus = svg
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  //adiciona circulos para tooltips
  focus.append("circle").attr("r", 4);

  //adiciona texto de tooltips na coordenada certa
  focus
    .append("text")
    .attr("x", 9)
    .attr("dy", ".35em")
    .style("background-color", "blue");

  //cria area consideravel para tooltip
  var overlay = svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() {
      focus.style("display", null);
    })
    .on("mouseout", function() {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove);

  //mouseovers das tooltips
  function mousemove() {
    var x0 = xScale.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.data > d1.data - x0 ? d1 : d0;
    focus.attr(
      "transform",
      "translate(" + xScale(d.data) + "," + yScale(d.tempo) + ")"
    );
    focus.select("text")
    .text(d.episodio + ": " + d.tempo + "min");
  }

  //coloca fonte do gráfico
  d3
    .select(".g-source-bold")
    .text("FONTE: ")
    .attr("class", "g-source-bold");

  d3
    .select(".g-source-reg")
    .html("Levantamento próprio/<a href='https://docs.google.com/spreadsheets/d/1wp6-jpAkC1YPGVKoWHPGDum8seHLJb5V1zbWaoDYeWE/edit?usp=sharing'>Dados aqui</a>")
    .attr("class", "g-source-reg");

  //RESPONSIVIDADE
  d3.select(window).on("resize", resized);

  function resized() {
    //nova margem
    var newMargin = { top: 10, right: 80, bottom: 20, left: 50 };

    //Get the width of the window
    var w = d3.select(".g-chart").node().clientWidth;
    console.log("resized", w);

    //muda a largura do svg
    d3.select("svg").attr("width", w);

    //muda a xScale
    xScale.range([0, w - newMargin.right]);

    //atualiza a linha
    line = d3.svg
      .line()
      .x(function(d) {
        return xScale(d.data);
      })
      .y(function(d) {
        return yScale(d.tempo);
      });
   

    d3.selectAll(".line").attr("d", line);
    //d3.selectAll(".area").attr("d", line);

    //atualiza xAxis
    xAxisGroup.call(xAxis);

    //atualiza os ticks
    xAxis.scale(xScale).ticks(numTicks(w));

    //atualiza yAxis
    yAxis.tickSize(-w - newMargin.right);
  }
}

//determina número de ticks baseado na largura
function numTicks(widther) {
  if (widther <=  900) {
    return 4;
    console.log("return 4");
  } else {
    return 12;
    console.log("return 2");
  }
}
