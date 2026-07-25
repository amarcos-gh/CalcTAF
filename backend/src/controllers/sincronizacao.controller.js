export async function sincronizar(req, res) {

  try {

    const resultados = [];

    for (const avaliacao of req.body) {

      try {

        const resposta = await processarAvaliacao(

          avaliacao

        );

        resultados.push({

          militarId: avaliacao.militarId,

          sucesso: true,

          id: resposta.id

        });

      } catch (erro) {

        resultados.push({

          militarId: avaliacao.militarId,

          sucesso: false,

          erro:

            erro.response?.data ||

            erro.message

        });

      }

    }

    return res.json({

      sucesso: true,

      resultados

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      sucesso: false,

      erro: error.message

    });

  }

}