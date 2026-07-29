require('/Users/rodrigo/Documents/SON-514-Metodologia-Investigacion/encuesta/estadistica.js');
const E = globalThis.Estad;

let fallos = 0;
function ok(nombre, obtenido, esperado, tol=0.001){
  const bien = Math.abs(obtenido-esperado) <= tol;
  if(!bien) fallos++;
  console.log(`${bien?'✔':'✘'} ${nombre.padEnd(46)} obtenido=${Number(obtenido).toFixed(5)}  esperado=${esperado}`);
}

console.log('\n— p-valores contra tablas estadísticas —');
// Valores críticos clásicos: chi2 al 5%
ok('chi²=3.841, gl=1  → p',      E.pChi2(3.8415,1), 0.05);
ok('chi²=5.991, gl=2  → p',      E.pChi2(5.9915,2), 0.05);
ok('chi²=16.919, gl=9 → p',      E.pChi2(16.919,9), 0.05);
ok('chi²=6.635, gl=1  → p',      E.pChi2(6.635,1),  0.01);
// t de Student bilateral
ok('t=2.086, gl=20 → p bilateral', E.pTdos(2.086,20), 0.05);
ok('t=1.960, gl=1e6 → p bilateral',E.pTdos(1.95996,1e6), 0.05);
ok('t=3.169, gl=10 → p bilateral', E.pTdos(3.169,10), 0.01);
// F
ok('F=4.351, gl 1,20 → p',       E.pF(4.3512,1,20), 0.05);
ok('F=3.493, gl 2,20 → p',       E.pF(3.4928,2,20), 0.05);
ok('F=3.885, gl 3,15 → p',       E.pF(3.2874,3,15), 0.05);

console.log('\n— descriptivas —');
// conjunto conocido
const x=[2,4,4,4,5,5,7,9];
const d=E.descriptivasNum(x);
ok('media de [2,4,4,4,5,5,7,9]', d.media, 5);
ok('desv. estándar muestral (n-1)', d.ds, 2.13809, 0.0001);
ok('varianza muestral', d.varianza, 4.57142, 0.0001);
ok('mediana', d.mediana, 4.5);
ok('Q1 (interpolación tipo 7)', d.q1, 4);
ok('Q3 (interpolación tipo 7)', d.q3, 5.5);
console.log(`  moda = [${d.modas}] (esperado 4)`);

console.log('\n— chi-cuadrado sobre tabla conocida —');
// Tabla 2x2 clásica: [[20,30],[30,20]] → chi2 = 4.0, gl=1
const cont = E.contingencia([
  ...Array(20).fill(['A','SI']), ...Array(30).fill(['A','NO']),
  ...Array(30).fill(['B','SI']), ...Array(20).fill(['B','NO']),
]);
ok('chi² tabla [[20,30],[30,20]]', cont.chi2, 4.0, 0.0001);
ok('gl', cont.gl, 1);
ok('p', cont.p, 0.0455, 0.001);
ok("V de Cramér", cont.cramer, 0.2, 0.0001);
console.log(`  esperadas todas = 25 → supuesto cumple: ${cont.supuesto.cumple}`);

console.log('\n— correlación / regresión —');
// x=[1..5], y=[2,4,5,4,5] → r conocido = 0.7746, b1=0.7, b0=1.9
const cor = E.correlacion([[1,2],[2,4],[3,5],[4,4],[5,5]]);
ok('r de Pearson', cor.r, 0.7746, 0.0005);
ok('r²', cor.r2, 0.6, 0.001);
ok('pendiente b1', cor.b1, 0.6, 0.0001);
ok('intercepto b0', cor.b0, 2.2, 0.0001);

console.log('\n— t de Welch —');
// dos grupos conocidos
const pg = E.porGrupo([
  ...[27.5,21.0,19.0,23.6,17.0,17.9,16.9,20.1].map(v=>['A',v]),
  ...[27.1,22.0,20.8,23.4,23.9,26.0,24.6,23.8].map(v=>['B',v]),
]);
console.log(`  ${pg.prueba.tipo}: t=${pg.prueba.t.toFixed(4)} gl=${pg.prueba.gl.toFixed(3)} p=${pg.prueba.p.toFixed(4)}`);
ok('t de Welch (verificado en Python)', Math.abs(pg.prueba.t), 2.42492, 0.0001);
ok('gl de Welch (verificado en Python)', pg.prueba.gl, 10.92937, 0.0001);

console.log('\n— ANOVA de un factor —');
// 3 grupos, valores conocidos: F = 9.0
const an = E.porGrupo([
  ...[1,2,3].map(v=>['G1',v]),
  ...[4,5,6].map(v=>['G2',v]),
  ...[7,8,9].map(v=>['G3',v]),
]);
ok('F (3 grupos 1-3,4-6,7-9)', an.prueba.F, 27, 0.001);
ok('gl entre', an.prueba.gl1, 2);
ok('gl dentro', an.prueba.gl2, 6);
ok('SC entre', an.prueba.sce, 54, 0.001);
ok('SC dentro', an.prueba.scd, 6, 0.001);

console.log(`\n${fallos===0 ? '✔ TODAS LAS PRUEBAS PASARON' : '✘ '+fallos+' PRUEBAS FALLARON'}\n`);
process.exit(fallos ? 1 : 0);
