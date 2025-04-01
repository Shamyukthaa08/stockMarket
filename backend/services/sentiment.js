const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

class SentimentModel {
  constructor() {
    this.model = null;
    this.thresholds = {
      positive: 0.65,
      negative: 0.35,
      neutral: [0.35, 0.65]
    };
  }

  async load() {
    this.model = await use.load();
  }

  async analyze(text) {
    const embeddings = await this.model.embed([text]);
    const scores = embeddings.arraySync()[0];
    const meanScore = tf.mean(scores).dataSync()[0];
    
    if (meanScore >= this.thresholds.positive) return 'positive';
    if (meanScore <= this.thresholds.negative) return 'negative';
    return 'neutral';
  }
}

module.exports = new SentimentModel();