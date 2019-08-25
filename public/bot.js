const botui = new BotUI('hello-world');

const next_question = async (ret) => {
    console.log("next question..")
    ret = await fetch('/next', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ret)
    });
    return await ret.json();
}

const ask = async (ret) => {
    console.log("ask");

    if (ret.message) {
        await botui.message.add(ret.message);
        ret = undefined;
    } else if (ret.input) {
        ret = await botui.action.text(ret.input);
    } else if (ret.choices) {
        ret = await botui.action.button(ret.choices);
    }

    return ret
}

const ask_question = async () => {

    let ret = undefined

    while (true) {
        ret = await next_question(ret);
        ret = await ask(ret);
        console.log(ret)
    }
}
