const fs = require('fs');

const text = `MASCULINO
01/50
Categoria: Estúdio
Nome do estilo: Estúdio 01/50
Impacto visual: Força, sofisticação e mistério cinematográfico.

02/50
Categoria: Estúdio
Nome do estilo: Estúdio 02/50
Impacto visual: Elegância corporativa e tom clássico de liderança.

03/50
Categoria: Estúdio
Nome do estilo: Estúdio 03/50
Impacto visual: Acessibilidade e calor em uma composição harmoniosa e natural.

04/50
Categoria: Estúdio
Nome do estilo: Estúdio 04/50
Impacto visual: Dinamismo, vitória e energia de sucesso.

05/50
Categoria: Estúdio
Nome do estilo: Estúdio 05/50
Impacto visual: Intensidade e masculinidade artística moderna.

06/50
Categoria: Estúdio
Nome do estilo: Estúdio 06/50
Impacto visual: Inteligência, confiança e apelo executivo.

07/50
Categoria: Estúdio
Nome do estilo: Estúdio 07/50
Impacto visual: Autoridade, postura de liderança e olhar focado.

08/50
Categoria: Estúdio
Nome do estilo: Estúdio 08/50
Impacto visual: Elegância dramática com forte contraste e seriedade.

09/50
Categoria: Estúdio
Nome do estilo: Estúdio 09/50
Impacto visual: Conexão direta, simpatia e comunicação assertiva.

10/50
Categoria: Estúdio
Nome do estilo: Estúdio 10/50
Impacto visual: Charme silencioso e atitude pensativa em tom noir.

11/50
Categoria: Estúdio
Nome do estilo: Estúdio 11/50
Impacto visual: Polidez moderna e presença assertiva.

12/50
Categoria: Estúdio
Nome do estilo: Estúdio 12/50
Impacto visual: Minimalismo dramático com foco intenso no olhar.

13/50
Categoria: Estúdio
Nome do estilo: Estúdio 13/50
Impacto visual: Sofisticação moderna com postura relaxada e segura.

14/50
Categoria: Estúdio
Nome do estilo: Estúdio 14/50
Impacto visual: Poder clássico, requinte e controle executivo.

15/50
Categoria: Estúdio
Nome do estilo: Estúdio 15/50
Impacto visual: Visão estratégica e profissionalismo corporativo de alto nível.

16/50
Categoria: Estúdio
Nome do estilo: Estúdio 16/50
Impacto visual: Mistério dominante, luxo e alta sofisticação executiva.

17/50
Categoria: Estúdio
Nome do estilo: Estúdio 17/50
Impacto visual: Charme dinâmico e perfil altamente engajador.

18/50
Categoria: Estúdio
Nome do estilo: Estúdio 18/50
Impacto visual: Proximidade inteligente com contraste profundo.

19/50
Categoria: Estúdio
Nome do estilo: Estúdio 19/50
Impacto visual: Simplicidade editorial, clareza e intelectualidade.

20/50
Categoria: Estúdio
Nome do estilo: Estúdio 20/50
Impacto visual: Ação, expressividade e domínio de palco.

21/50
Categoria: Cenário
Nome do estilo: Cenário 21/50
Impacto visual: Desempenho premium em ambiente noturno de alto foco.

22/50
Categoria: Cenário
Nome do estilo: Cenário 22/50
Impacto visual: Rotina casual e produtiva em ambiente acolhedor.

23/50
Categoria: Cenário
Nome do estilo: Cenário 23/50
Impacto visual: Perspectiva visionária e foco nos negócios.

24/50
Categoria: Cenário
Nome do estilo: Cenário 24/50
Impacto visual: Contraste cru e textura urbana com aura de mistério.

25/50
Categoria: Cenário
Nome do estilo: Cenário 25/50
Impacto visual: Energia caótica da cidade equilibrada com luz dourada.

26/50
Categoria: Cenário
Nome do estilo: Cenário 26/50
Impacto visual: Triunfo majestoso com escala urbana e requinte.

27/50
Categoria: Cenário
Nome do estilo: Cenário 27/50
Impacto visual: Intelecto afiado, tradição e força profissional.

28/50
Categoria: Cenário
Nome do estilo: Cenário 28/50
Impacto visual: Estilo relaxado, urbano e editorial moderno.

29/50
Categoria: Cenário
Nome do estilo: Cenário 29/50
Impacto visual: Noir cinematográfico evocativo com ritmo fantasmagórico urbano.

30/50
Categoria: Cenário
Nome do estilo: Cenário 30/50
Impacto visual: Estética europeia sofisticada com elegância misteriosa.

31/50
Categoria: Cenário
Nome do estilo: Cenário 31/50
Impacto visual: Sucesso moderno e acessibilidade em lounge contemporâneo.

32/50
Categoria: Cenário
Nome do estilo: Cenário 32/50
Impacto visual: Elegância urbana, ambição e sofisticação casual.

33/50
Categoria: Cenário
Nome do estilo: Cenário 33/50
Impacto visual: Espírito explorador, dinamismo urbano e luz dourada.

34/50
Categoria: Cenário
Nome do estilo: Cenário 34/50
Impacto visual: Carisma acessível com atitude levemente rebelde.

35/50
Categoria: Cenário
Nome do estilo: Cenário 35/50
Impacto visual: Presença cinematográfica dramática com perspectiva imersiva.

36/50
Categoria: Cenário
Nome do estilo: Cenário 36/50
Impacto visual: Estética urbana com toque rústico e estilo vintage autêntico.

37/50
Categoria: Cenário
Nome do estilo: Cenário 37/50
Impacto visual: Energia lúdica, assertiva e estética de moda vanguardista.

38/50
Categoria: Cenário
Nome do estilo: Cenário 38/50
Impacto visual: Confiança ágil e estética streetwear de alto padrão.

39/50
Categoria: Cenário
Nome do estilo: Cenário 39/50
Impacto visual: Abordagem natural, relaxada, acolhedora e intelectual.

40/50
Categoria: Cenário
Nome do estilo: Cenário 40/50
Impacto visual: Presença enigmática e ousada em atmosfera industrial.

41/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 41/50
Impacto visual: Charme caloroso, sorriso espontâneo e elegância sem esforço.

42/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 42/50
Impacto visual: Aura clássica rebelde e estética vibrante de atitude.

43/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 43/50
Impacto visual: Liderança majestosa e controle com contraste monocromático dramático.

44/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 44/50
Impacto visual: Intensidade misteriosa com iluminação e sombras profundas.

45/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 45/50
Impacto visual: Sofisticação contemporânea e conforto em ambiente luxuoso.

46/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 46/50
Impacto visual: Grandeza executiva, autoridade inquestionável e poder clássico.

47/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 47/50
Impacto visual: Criatividade envolvente e vibração de nômade digital produtivo.

48/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 48/50
Impacto visual: Confiança rústica, simpatia genuína e calor humano autêntico.

49/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 49/50
Impacto visual: Elegância contemporânea, carisma e sucesso sem esforço.

50/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 50/50
Impacto visual: Visão futurista, postura imponente e determinação corporativa.

FEMININO
01/50
Categoria: Estúdio
Nome do estilo: Estúdio 01/50
Impacto visual: Elegância minimalista, autoconfiança e poder sutil.

02/50
Categoria: Estúdio
Nome do estilo: Estúdio 02/50
Impacto visual: Sofisticação moderna e feminilidade poderosa com contraste marcante.

03/50
Categoria: Estúdio
Nome do estilo: Estúdio 03/50
Impacto visual: Entusiasmo, calor humano e dinamismo acolhedor.

04/50
Categoria: Estúdio
Nome do estilo: Estúdio 04/50
Impacto visual: Energia vibrante, carisma expansivo e surpresa agradável.

05/50
Categoria: Estúdio
Nome do estilo: Estúdio 05/50
Impacto visual: Liderança graciosa, profissionalismo e postura acessível.

06/50
Categoria: Estúdio
Nome do estilo: Estúdio 06/50
Impacto visual: Dinamismo contemporâneo, confiança e apelo executivo moderno.

07/50
Categoria: Estúdio
Nome do estilo: Estúdio 07/50
Impacto visual: Foco acadêmico, intelecto e postura analítica requintada.

08/50
Categoria: Estúdio
Nome do estilo: Estúdio 08/50
Impacto visual: Cores vibrantes, calor radiante e dinamismo em apresentações.

09/50
Categoria: Estúdio
Nome do estilo: Estúdio 09/50
Impacto visual: Poder brilhante, charme polido e estética calorosa.

10/50
Categoria: Estúdio
Nome do estilo: Estúdio 10/50
Impacto visual: Força marcante, ousadia e liderança de estilo editorial.

11/50
Categoria: Estúdio
Nome do estilo: Estúdio 11/50
Impacto visual: Postura reflexiva, inteligência sofisticada e beleza calma.

12/50
Categoria: Estúdio
Nome do estilo: Estúdio 12/50
Impacto visual: Serenidade profissional, compostura e minimalismo chique.

13/50
Categoria: Estúdio
Nome do estilo: Estúdio 13/50
Impacto visual: Empoderamento calmo e elegância estruturada em estética atemporal.

14/50
Categoria: Estúdio
Nome do estilo: Estúdio 14/50
Impacto visual: Presença digital executiva com toque marcante e luxuoso.

15/50
Categoria: Estúdio
Nome do estilo: Estúdio 15/50
Impacto visual: Clareza brilhante, simpatia envolvente e comunicação assertiva.

16/50
Categoria: Estúdio
Nome do estilo: Estúdio 16/50
Impacto visual: Engajamento social ágil com sofisticação casual impecável.

17/50
Categoria: Estúdio
Nome do estilo: Estúdio 17/50
Impacto visual: Aproximação relaxada, calor humano e integração com a tecnologia.

18/50
Categoria: Estúdio
Nome do estilo: Estúdio 18/50
Impacto visual: Aura intelectual profunda e centelha de inspiração criativa.

19/50
Categoria: Estúdio
Nome do estilo: Estúdio 19/50
Impacto visual: Autoridade imponente, refinamento clássico e luxo monocromático.

20/50
Categoria: Estúdio
Nome do estilo: Estúdio 20/50
Impacto visual: Elegância vibrante, contraste acolhedor e charme motivacional.

21/50
Categoria: Cenário
Nome do estilo: Cenário 21/50
Impacto visual: Conforto luminoso, intimidade e graciosidade executiva.

22/50
Categoria: Cenário
Nome do estilo: Cenário 22/50
Impacto visual: Liderança inspiradora com forte conexão à luz urbana.

23/50
Categoria: Cenário
Nome do estilo: Cenário 23/50
Impacto visual: Alegria radiante, leveza e confiança em ambiente empreendedor.

24/50
Categoria: Cenário
Nome do estilo: Cenário 24/50
Impacto visual: Refinamento aconchegante e postura profissional convidativa.

25/50
Categoria: Cenário
Nome do estilo: Cenário 25/50
Impacto visual: Foco produtivo apaixonado com charme acolhedor de cafeteria.

26/50
Categoria: Cenário
Nome do estilo: Cenário 26/50
Impacto visual: Comunicação digital moderna com leveza, carisma e clareza.

27/50
Categoria: Cenário
Nome do estilo: Cenário 27/50
Impacto visual: Poder carismático formidável e ambiente de luxo imponente.

28/50
Categoria: Cenário
Nome do estilo: Cenário 28/50
Impacto visual: Beleza atemporal, sofisticação vintage e postura serena.

29/50
Categoria: Cenário
Nome do estilo: Cenário 29/50
Impacto visual: Elegância aconchegante iluminada por tons requintados e suaves.

30/50
Categoria: Cenário
Nome do estilo: Cenário 30/50
Impacto visual: Dinamismo executivo multi-tarefa com estilo de alto padrão.

31/50
Categoria: Cenário
Nome do estilo: Cenário 31/50
Impacto visual: Decisão vibrante, estilo refinado e ambiente intelectual acolhedor.

32/50
Categoria: Cenário
Nome do estilo: Cenário 32/50
Impacto visual: Poder minimalista, atitude e clareza estética de alta moda.

33/50
Categoria: Cenário
Nome do estilo: Cenário 33/50
Impacto visual: Presença forte e dominante em ambiente de negócios afiado.

34/50
Categoria: Cenário
Nome do estilo: Cenário 34/50
Impacto visual: Liderança polida, foco apurado e produtividade empoderada.

35/50
Categoria: Cenário
Nome do estilo: Cenário 35/50
Impacto visual: Charme glamoroso, requinte exclusivo e brilho intimista caloroso.

36/50
Categoria: Cenário
Nome do estilo: Cenário 36/50
Impacto visual: Graciosidade imponente e poder refinado de alta classe.

37/50
Categoria: Cenário
Nome do estilo: Cenário 37/50
Impacto visual: Simpatia calorosa, harmonia de tons e estética de negócios suave.

38/50
Categoria: Cenário
Nome do estilo: Cenário 38/50
Impacto visual: Moda corporativa chique iluminada de forma dourada e convidativa.

39/50
Categoria: Cenário
Nome do estilo: Cenário 39/50
Impacto visual: Foco produtivo elegante adornado com toques de delicadeza romântica.

40/50
Categoria: Cenário
Nome do estilo: Cenário 40/50
Impacto visual: Sofisticação corporativa de altíssimo nível com brilho executivo cinematográfico.

41/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 41/50
Impacto visual: Visão estratégica, simbologia de poder e estilo marcante.

42/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 42/50
Impacto visual: Introspecção enigmática, charme analítico e iluminação dramática.

43/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 43/50
Impacto visual: Inteligência competitiva e liderança acentuada com contraste rústico.

44/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 44/50
Impacto visual: Determinação calculada, intelecto profundo e atmosfera sombria.

45/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 45/50
Impacto visual: Alegria vibrante, energia leve e casualidade fashionista colorida.

46/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 46/50
Impacto visual: Poder luminoso, moda destemida e vida urbana noturna eletrizante.

47/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 47/50
Impacto visual: Liberdade casual, energia descontraída e positividade em movimento.

48/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 48/50
Impacto visual: Charme editorial arrojado, ousadia pura e carisma imbatível.

49/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 49/50
Impacto visual: Mistério magnético e intenso foco estético com luxo pontual.

50/50
Categoria: Lifestyle
Nome do estilo: Lifestyle 50/50
Impacto visual: Magia conceitual, controle lúdico e elegância luxuosa flutuante.
`;

const lines = text.split('\\n').map(l => l.trim());
let sqlStatements = [];

let currentGender = "Masculino";
const dicaRoupa = "Prefira roupas lisas, blazers ou camisas de cores neutras. Evite estampas muito chamativas para um resultado mais elegante com a IA.";

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    if (line === "MASCULINO") {
        currentGender = "Masculino";
        continue;
    } else if (line === "FEMININO") {
        currentGender = "Feminino";
        continue;
    }
    
    if (line.match(/^\\d{2}\\/50$/)) {
        continue;
    }
    
    if (line.startsWith("Categoria:")) {
        const categoria = line.split(":")[1].trim();
        
        i++;
        while (i < lines.length && !lines[i].startsWith("Nome do estilo:")) i++;
        if (i >= lines.length) break;
        const titulo = lines[i].split(":")[1].trim();
        
        i++;
        while (i < lines.length && !lines[i].startsWith("Impacto visual:")) i++;
        if (i >= lines.length) break;
        const impacto = lines[i].split(":")[1].trim();
        
        const tituloSql = titulo.replace(/'/g, "''");
        const categoriaSql = categoria.replace(/'/g, "''");
        const impactoSql = impacto.replace(/'/g, "''");
        
        const sql = \`INSERT INTO public.estilos (titulo, categoria, descricao, genero, dica_roupa, img_url) VALUES ('\${tituloSql}', '\${categoriaSql}', '\${impactoSql}', '\${currentGender}', '\${dicaRoupa}', '');\`;
        sqlStatements.push(sql);
    }
}

fs.writeFileSync('f:/SITES GITHUB/virtual-studio/inserts_centena_estilos.sql', '-- Inserts de 100 estilos\\n' + sqlStatements.join('\\n'), 'utf-8');
console.log('Gerados: ' + sqlStatements.length);
