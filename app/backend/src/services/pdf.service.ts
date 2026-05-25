import puppeteer from 'puppeteer'

export const generarPDFPropuesta = async (propuesta: any): Promise<Buffer> => {
  const cliente = propuesta.oportunidad.cliente
  const cotizacion = propuesta.cotizacion
  const solicitud = cotizacion.solicitud
  const contacto = propuesta.oportunidad.cliente.contactos?.[0]
  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 50px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
    .logo-placeholder { font-size: 26px; font-weight: 900; color: #333; letter-spacing: -1px; }
    .logo-sub { font-size: 9px; color: #666; margin-top: 2px; }
    .iso-badge { border: 2px solid #333; padding: 4px 10px; text-align: center; }
    .iso-badge .iso-label { font-size: 10px; font-weight: bold; }
    .iso-badge .iso-num { font-size: 16px; font-weight: 900; }

    .data-local { text-align: right; margin-bottom: 35px; }

    .destinatario { margin-bottom: 10px; line-height: 1.7; }
    .numero-proposta { text-align: right; font-size: 13px; font-weight: bold; margin-bottom: 35px; }

    .titulo-secao { font-weight: bold; font-size: 12px; margin: 25px 0 12px; text-transform: uppercase; }

    .residuo-item { margin-bottom: 16px; }
    .residuo-item p { line-height: 1.7; margin-left: 16px; }

    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; }
    th { border: 1px solid #333; padding: 7px 10px; text-align: center; font-weight: bold; font-size: 11px; }
    td { border: 1px solid #333; padding: 7px 10px; text-align: center; font-size: 11px; }
    td.left { text-align: left; }

    .dados-finais { margin: 15px 0; line-height: 2; }
    .dados-finais p strong { margin-right: 6px; }

    .contratada { margin: 20px 0 10px; line-height: 1.8; }

    .assinatura { margin-top: 45px; line-height: 1.7; }
    .linha { border-top: 1px solid #333; width: 220px; margin-bottom: 6px; }
  </style>
</head>
<body>

<div class="header">
  <div style="width:180px;">
    <svg viewBox="0 0 512 225.77733" width="180" xmlns="http://www.w3.org/2000/svg" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><defs><clipPath id="clipPath18" clipPathUnits="userSpaceOnUse"><path d="M 0,169.333 H 384 V 0 H 0 Z"/></clipPath></defs><g transform="matrix(1.3333333,0,0,-1.3333333,0,225.77733)"><g><g clip-path="url(#clipPath18)"><g transform="translate(36.7495,44.3926)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -0.468,-0.175 -1.399,-0.44 -2.488,-0.44 -1.219,0 -2.227,0.31 -3.018,1.066 -0.693,0.67 -1.125,1.745 -1.125,3 0,2.407 1.664,4.166 4.368,4.166 0.931,0 1.674,-0.202 2.025,-0.373 L -0.504,6.573 c -0.432,0.202 -0.972,0.347 -1.781,0.347 -1.966,0 -3.244,-1.22 -3.244,-3.244 0,-2.047 1.219,-3.253 3.109,-3.253 0.684,0 1.151,0.095 1.39,0.212 v 2.407 h -1.629 v 0.836 l 2.659,0 z"/></g><g transform="translate(60.981,117.9106)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c 9.308,0 16.556,-2.866 21.752,-8.597 5.196,-5.732 7.792,-12.57 7.792,-20.507 0,-7.838 -2.596,-14.626 -7.792,-20.354 C 16.556,-55.194 9.308,-58.055 0,-58.055 c -8.229,0 -15.432,2.592 -21.604,7.788 -6.172,5.191 -9.259,11.904 -9.259,20.138 v 45.183 h 16.903 v -45.183 c 0.49,-3.235 2.083,-5.881 4.777,-7.942 2.691,-2.055 5.755,-3.086 9.183,-3.086 4.018,0 7.203,1.372 9.556,4.116 2.353,2.742 3.527,5.931 3.527,9.557 0,3.523 -1.103,6.537 -3.307,9.034 -2.205,2.501 -5.466,3.752 -9.776,3.752 -2.546,0 -4.629,-0.175 -6.245,-0.517 -1.615,-0.342 -4.593,-1.791 -5.745,-3.154 v 15.683 c 1.678,0.801 3.667,1.674 6.479,2.169 C -3.788,-0.211 -1.962,0 0,0"/></g><g transform="translate(123.0928,117.9106)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 v -14.698 c -4.701,0 -8.08,-0.859 -10.141,-2.573 -2.055,-1.714 -3.081,-4.243 -3.081,-7.567 v -31.745 h -15.436 v 31.745 c 0,8.228 2.227,14.423 6.69,18.589 C -17.51,-2.087 -10.19,0 0,0"/></g><g transform="translate(278.0435,61.3447)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -13.254,15.872 v -15.89 h -15.432 v 72.227 h 15.432 V 38.485 L 1.588,56.417 H 21.721 L -2.672,27.314 6.825,15.499 h 2.213 1.246 3.253 c 4.522,0.314 9.29,1.813 11.36,6.218 2.182,4.652 1.48,9.907 2.083,14.865 0.54,4.427 1.763,8.935 4.211,12.705 3.086,4.755 10.703,7.13 22.855,7.13 V 40.253 c -4.994,0 -8.063,-0.909 -9.188,-2.722 C 43.734,35.718 42.803,31.579 42.069,25.11 41.269,18.05 38.866,7.388 31.987,3.662 29.711,2.43 27.236,1.358 24.699,0.823 21.096,0.059 17.397,-0.207 13.722,-0.176 9.15,-0.131 4.575,-0.059 0,0"/></g><g transform="translate(157.7163,118.8423)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -16.178,2.429 -31.263,-8.728 -33.688,-24.906 -2.425,-16.188 8.728,-31.269 24.911,-33.694 10.59,-1.583 20.695,2.654 27.106,10.303 l 2.803,-2.349 -3.15,13.483 -9.551,0.706 -4.625,0.343 3.073,-2.578 c -3.176,-3.802 -8.184,-5.912 -13.442,-5.124 -8.018,1.201 -13.547,8.675 -12.346,16.692 1.201,8.021 8.679,13.546 16.696,12.345 8.017,-1.201 13.546,-8.674 12.345,-16.696 C 9.97,-32.55 9.691,-33.58 9.317,-34.561 l 10.245,-0.756 1.952,-8.373 c 1.677,3.019 2.856,6.384 3.395,10.002 C 27.339,-17.505 16.183,-2.42 0,0"/></g><g transform="translate(211.437,60.2422)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 C 16.183,-2.42 31.272,8.729 33.692,24.912 36.117,41.095 24.965,56.18 8.782,58.604 -1.809,60.188 -11.918,55.95 -18.324,48.297 l -2.803,2.353 3.145,-13.483 9.555,-0.706 4.625,-0.342 -3.072,2.578 c 3.172,3.801 8.187,5.911 13.442,5.124 C 14.586,42.62 20.11,35.147 18.909,27.125 17.708,19.107 10.235,13.583 2.218,14.784 c -8.022,1.201 -13.546,8.675 -12.345,16.692 0.162,1.08 0.44,2.11 0.814,3.091 l -10.24,0.755 -1.957,8.373 c -1.677,-3.023 -2.856,-6.384 -3.4,-10.001 C -27.335,17.51 -16.178,2.425 0,0"/></g><g transform="translate(255.0854,39.5293)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 h -1.813 v -4.301 h 1.912 c 1.057,0 1.782,0.086 2.16,0.247 0.378,0.167 0.679,0.419 0.913,0.775 0.229,0.346 0.342,0.719 0.342,1.125 0,0.413 -0.121,0.791 -0.365,1.133 C 2.906,-0.675 2.564,-0.418 2.114,-0.252 1.669,-0.085 0.968,0 0,0 M -0.144,5.804 H -1.813 V 1.728 h 1.292 c 1.034,0 1.772,0.198 2.208,0.589 0.437,0.396 0.657,0.909 0.657,1.538 0,1.301 -0.832,1.949 -2.488,1.949 M 0.832,-6.028 H -3.757 V 7.531 h 3.555 c 1.12,0 1.993,-0.148 2.618,-0.45 C 3.046,6.78 3.522,6.366 3.855,5.84 4.184,5.309 4.351,4.701 4.351,4.009 4.351,2.677 3.657,1.719 2.281,1.143 3.271,0.958 4.058,0.554 4.643,-0.076 5.232,-0.701 5.524,-1.457 5.524,-2.33 5.524,-3.019 5.345,-3.64 4.989,-4.184 4.634,-4.724 4.112,-5.169 3.424,-5.511 2.73,-5.853 1.872,-6.028 0.832,-6.028"/></g><g transform="translate(227.1245,39.2461)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 -2.187,4.913 -4.211,0 Z m -2.848,7.892 h 1.364 L 4.594,-5.745 H 2.609 l -1.808,4.022 h -5.785 l -1.697,-4.022 h -1.993 z"/></g><g transform="translate(245.2915,47.0605)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 h 1.812 v -13.56 h -1.947 v 10.55 l -4.171,-5.241 h -0.359 l -4.221,5.241 v -10.55 h -1.938 V 0 h 1.84 l 4.503,-5.569 z"/></g><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 263.845,47.061 h 1.938 v -13.56 h -1.938 z"/><g transform="translate(270.0981,47.0605)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 H 7.685 V -1.728 H 1.939 V -5.862 H 7.491 V -7.599 H 1.939 v -4.214 h 5.93 v -1.729 H 0 Z"/></g><g transform="translate(292.1118,47.0605)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 H 1.845 V -13.56 H 0.175 L -8.89,-3.113 V -13.56 h -1.827 V 0 h 1.575 L 0,-10.532 Z"/></g><g transform="translate(297.0063,47.083)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 H 11.328 V -1.728 H 6.6 V -13.582 H 4.652 v 11.854 l -4.652,0 z"/></g><g transform="translate(316.6665,39.2461)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 -2.19,4.913 -4.22,0 Z m -2.856,7.892 h 1.367 L 4.589,-5.745 H 2.601 l -1.804,4.022 h -5.786 l -1.697,-4.022 h -1.992 z"/></g><g transform="translate(324.0454,47.0605)"><path style="fill:#231f20;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 H 1.938 V -11.792 H 8.044 V -13.56 H 0 Z"/></g><g transform="translate(338.9497,133.5952)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -0.026,-1.683 h 0.655 c 0.33,0 0.582,0.072 0.753,0.215 0.172,0.144 0.257,0.355 0.257,0.633 0,0.273 -0.078,0.48 -0.237,0.622 C 1.244,-0.071 1.014,0 0.712,0 Z m -1.586,1.125 h 2.359 c 0.806,0 1.41,-0.143 1.811,-0.428 0.401,-0.286 0.602,-0.716 0.602,-1.29 0,-0.469 -0.117,-0.843 -0.349,-1.121 -0.233,-0.278 -0.583,-0.46 -1.048,-0.545 0.195,-0.067 0.367,-0.173 0.514,-0.316 0.146,-0.144 0.29,-0.347 0.43,-0.611 L 3.744,-5.084 H 1.978 L 1.09,-3.331 c -0.1,0.193 -0.206,0.329 -0.319,0.407 -0.113,0.077 -0.275,0.116 -0.486,0.116 h -0.311 l -0.036,-2.276 h -1.612 z"/></g><g transform="translate(339.7495,137.0054)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -2.913,0 -5.282,-2.37 -5.282,-5.283 0,-2.912 2.369,-5.282 5.282,-5.282 2.913,0 5.283,2.37 5.283,5.282 C 5.283,-2.37 2.913,0 0,0 m 0,-11.504 c -3.431,0 -6.222,2.791 -6.222,6.221 0,3.431 2.791,6.222 6.222,6.222 3.431,0 6.223,-2.791 6.223,-6.222 0,-3.43 -2.792,-6.221 -6.223,-6.221"/></g></g></g></g></svg>
  </div>
  <div class="iso-badge">
    <div class="iso-label">ISO</div>
    <div class="iso-num">9001</div>
  </div>
</div>

  <div class="data-local">Palhoça, ${hoje}.</div>

  <div class="destinatario">
    À<br>
    <strong>${cliente.nombre.toUpperCase()}</strong><br>
    ${contacto ? `A/C ${contacto.nombre}` : ''}
  </div>

  <div class="numero-proposta">${propuesta.numeroPropuesta}</div>

  <div class="titulo-secao">Proposta Operacional</div>

  ${cotizacion.items.map((item: any, i: number) => `
    <div class="residuo-item">
      <strong>${i + 1}. ${item.descripcion.toUpperCase()}</strong>
      <p>Estes resíduos serão coletados de acordo com a frequência estabelecida e encaminhados para destinação devidamente licenciada.</p>
    </div>
  `).join('')}

  <div class="titulo-secao">Proposta Comercial</div>

  <table>
    <thead>
      <tr>
        <th>ITEM</th>
        <th>SERVIÇO</th>
        <th>QTDE</th>
        <th>FREQUÊNCIA</th>
        <th>VALOR TRANSPORTE</th>
        <th>VALOR DESTINO FINAL</th>
      </tr>
    </thead>
    <tbody>
      ${cotizacion.items.map((item: any, i: number) => {
        const franquia = Number(item.franquia)
        const precioFinal = Number(item.precioFinal)
        const subtotal = Number(item.subtotal)
        const valorTransporte = franquia > 0
          ? `R$ ${(precioFinal * franquia).toFixed(2)}<br><small>por ${franquia} ${item.unidad.toLowerCase()}</small>`
          : `R$ ${subtotal.toFixed(2)}`
        const valorDestino = item.tarifaBase?.precioExcedente
          ? `R$ ${Number(item.tarifaBase.precioExcedente).toFixed(2)} por ${item.unidad.toLowerCase()}`
          : '—'
        return `
        <tr>
          <td>${i + 1}</td>
          <td class="left">${item.descripcion}</td>
          <td>${Number(item.cantidad).toLocaleString('pt-BR')} ${item.unidad.toLowerCase()}</td>
          <td>${solicitud.frecuenciaServicio}</td>
          <td>${valorTransporte}</td>
          <td>${valorDestino}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>

  <div class="dados-finais">
    <p><strong>Local de coleta:</strong> ${solicitud.direccionServicio}</p>
    <p><strong>Condições de pagamento:</strong> ${propuesta.condicionesPago || 'Prazo de faturamento 30 dias'}.</p>
    <p><strong>Validade da Proposta:</strong> ${propuesta.validadeDias || 5} dias.</p>
  </div>

  <p>Atenciosamente,</p>

  <div class="assinatura">
    <br>
    <div class="linha"></div>
    <p>${propuesta.nombreFirmante || (propuesta.usuario?.nombre || 'Departamento Comercial')}</p>
    <p>${propuesta.cargoFirmante || 'Departamento Comercial'}</p>
    <p>Brooks Ambiental</p>
  </div>

</body>
</html>`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '30px', bottom: '30px', left: '40px', right: '40px' },
    printBackground: true
  })
  await browser.close()
  return Buffer.from(pdf)
}

export const generarPDFOrdenServicio = async (orden: any): Promise<Buffer> => {
  const cliente = orden.oportunidad.cliente
  const propuesta = orden.oportunidad.propuestas?.[0]
  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 50px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .iso-badge { border: 2px solid #333; padding: 4px 10px; text-align: center; }
    .iso-badge .iso-label { font-size: 10px; font-weight: bold; }
    .iso-badge .iso-num { font-size: 16px; font-weight: 900; }
    .doc-title { text-align: center; margin-bottom: 30px; }
    .doc-title h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
    .doc-title .os-num { font-size: 13px; color: #b61b24; font-weight: bold; margin-top: 4px; }
    .doc-title .data { font-size: 11px; color: #666; margin-top: 2px; }
    .secao { margin-bottom: 20px; }
    .secao-titulo { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #b61b24; border-bottom: 1px solid #b61b24; padding-bottom: 4px; margin-bottom: 10px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .campo { line-height: 1.8; }
    .campo .label { font-weight: bold; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #b61b24; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
    td { border-bottom: 1px solid #eee; padding: 7px 10px; font-size: 11px; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
    .assinatura { text-align: center; }
    .assinatura .linha { border-top: 1px solid #333; width: 200px; margin: 0 auto 6px; }
    .rodape { font-size: 9px; color: #aaa; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 8px; }
    .badge { display: inline-block; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>

<div class="header">
  <div style="width:160px;">
    <svg viewBox="0 0 512 225.77733" width="160" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c" clipPathUnits="userSpaceOnUse"><path d="M 0,169.333 H 384 V 0 H 0 Z"/></clipPath></defs><g transform="matrix(1.3333333,0,0,-1.3333333,0,225.77733)"><g><g clip-path="url(#c)"><g transform="translate(60.981,117.9106)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c 9.308,0 16.556,-2.866 21.752,-8.597 5.196,-5.732 7.792,-12.57 7.792,-20.507 0,-7.838 -2.596,-14.626 -7.792,-20.354 C 16.556,-55.194 9.308,-58.055 0,-58.055 c -8.229,0 -15.432,2.592 -21.604,7.788 -6.172,5.191 -9.259,11.904 -9.259,20.138 v 45.183 h 16.903 v -45.183 c 0.49,-3.235 2.083,-5.881 4.777,-7.942 2.691,-2.055 5.755,-3.086 9.183,-3.086 4.018,0 7.203,1.372 9.556,4.116 2.353,2.742 3.527,5.931 3.527,9.557 0,3.523 -1.103,6.537 -3.307,9.034 -2.205,2.501 -5.466,3.752 -9.776,3.752 -2.546,0 -4.629,-0.175 -6.245,-0.517 -1.615,-0.342 -4.593,-1.791 -5.745,-3.154 v 15.683 c 1.678,0.801 3.667,1.674 6.479,2.169 C -3.788,-0.211 -1.962,0 0,0"/></g><g transform="translate(123.0928,117.9106)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 v -14.698 c -4.701,0 -8.08,-0.859 -10.141,-2.573 -2.055,-1.714 -3.081,-4.243 -3.081,-7.567 v -31.745 h -15.436 v 31.745 c 0,8.228 2.227,14.423 6.69,18.589 C -17.51,-2.087 -10.19,0 0,0"/></g><g transform="translate(278.0435,61.3447)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -13.254,15.872 v -15.89 h -15.432 v 72.227 h 15.432 V 38.485 L 1.588,56.417 H 21.721 L -2.672,27.314 22.284,0Z"/></g><g transform="translate(157.7163,118.8423)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -16.178,2.429 -31.263,-8.728 -33.688,-24.906 -2.425,-16.188 8.728,-31.269 24.911,-33.694 10.59,-1.583 20.695,2.654 27.106,10.303 l 2.803,-2.349 -3.15,13.483 -9.551,0.706 -4.625,0.343 3.073,-2.578 c -3.176,-3.802 -8.184,-5.912 -13.442,-5.124 -8.018,1.201 -13.547,8.675 -12.346,16.692 1.201,8.021 8.679,13.546 16.696,12.345 8.017,-1.201 13.546,-8.674 12.345,-16.696 C 9.97,-32.55 9.691,-33.58 9.317,-34.561 l 10.245,-0.756 1.952,-8.373 c 1.677,3.019 2.856,6.384 3.395,10.002 C 27.339,-17.505 16.183,-2.42 0,0"/></g><g transform="translate(211.437,60.2422)"><path style="fill:#b61b24;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 C 16.183,-2.42 31.272,8.729 33.692,24.912 36.117,41.095 24.965,56.18 8.782,58.604 -1.809,60.188 -11.918,55.95 -18.324,48.297 l -2.803,2.353 3.145,-13.483 9.555,-0.706 4.625,-0.342 -3.072,2.578 c 3.172,3.801 8.187,5.911 13.442,5.124 C 14.586,42.62 20.11,35.147 18.909,27.125 17.708,19.107 10.235,13.583 2.218,14.784 c -8.022,1.201 -13.546,8.675 -12.345,16.692 0.162,1.08 0.44,2.11 0.814,3.091 l -10.24,0.755 -1.957,8.373 c -1.677,-3.023 -2.856,-6.384 -3.4,-10.001 C -27.335,17.51 -16.178,2.425 0,0"/></g></g></g></g></svg>
  </div>
  <div style="text-align:center; flex:1;">
    <div style="font-size:14px; font-weight:bold; text-transform:uppercase; letter-spacing:2px;">Ordem de Serviço</div>
    <div style="font-size:20px; font-weight:900; color:#b61b24; margin-top:4px;">OS #${orden.id.slice(0,8).toUpperCase()}</div>
    <div style="font-size:11px; color:#666; margin-top:2px;">${hoje}</div>
  </div>
  <div class="iso-badge">
    <div class="iso-label">ISO</div>
    <div class="iso-num">9001</div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">Dados do Cliente</div>
  <div class="grid2">
    <div class="campo"><span class="label">Empresa: </span>${cliente.nombre}</div>
    <div class="campo"><span class="label">CNPJ/CPF: </span>${cliente.documentoFiscal}</div>
    <div class="campo"><span class="label">Endereço: </span>${cliente.direccion || '—'}</div>
    <div class="campo"><span class="label">Segmento: </span>${cliente.segmento || '—'}</div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">Dados do Serviço</div>
  <div class="grid2">
    <div class="campo"><span class="label">Tipo de serviço: </span>${orden.tipoServicio}</div>
    <div class="campo"><span class="label">Frequência: </span>${orden.frecuenciaServicio}</div>
    <div class="campo"><span class="label">Endereço de coleta: </span>${orden.direccionServicio}</div>
    <div class="campo"><span class="label">Unidade operacional: </span>${orden.unidadeOperacional || 'Filial Palhoça'}</div>
  </div>
</div>

${orden.observaciones ? `
<div class="secao">
  <div class="secao-titulo">Observações Operacionais</div>
  <p style="line-height:1.8; margin-top:6px;">${orden.observaciones}</p>
</div>` : ''}

${propuesta ? `
<div class="secao">
  <div class="secao-titulo">Referência Comercial</div>
  <div class="grid2">
    <div class="campo"><span class="label">Proposta: </span>${propuesta.numeroPropuesta} v${propuesta.version}</div>
    <div class="campo"><span class="label">Condições: </span>${propuesta.condicionesPago || 'Prazo de faturamento 30 dias'}</div>
  </div>
</div>` : ''}

<div class="footer">
  <div class="assinatura">
    <div class="linha"></div>
    <div style="font-size:11px;">Responsável Operacional</div>
    <div style="font-size:10px; color:#666;">Brooks Ambiental</div>
  </div>
  <div class="assinatura">
    <div class="linha"></div>
    <div style="font-size:11px;">Responsável Cliente</div>
    <div style="font-size:10px; color:#666;">${cliente.nombre}</div>
  </div>
</div>

<div class="rodape">
  Ordem de Serviço gerada pelo sistema Brooks CRM — ${new Date().toLocaleString('pt-BR')}
</div>

</body>
</html>`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '30px', bottom: '30px', left: '40px', right: '40px' },
    printBackground: true
  })
  await browser.close()
  return Buffer.from(pdf)
}