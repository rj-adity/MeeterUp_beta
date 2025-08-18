import { useState } from 'react';

const ChatPoll = ({ channel, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isCreating, setIsCreating] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      return;
    }

    setIsCreating(true);
    try {
      const pollData = {
        question: question.trim(),
        options: options.filter(opt => opt.trim()),
        votes: {},
        totalVotes: 0,
        createdAt: new Date().toISOString(),
        createdBy: channel.client.userID,
      };

      await channel.sendMessage({
        text: `Poll: ${pollData.question}\n\n${pollData.options.map((option, index) => 
          `${index + 1}. ${option}`
        ).join('\n')}\n\nReact with the number to vote.`,
        customType: 'poll',
        poll: pollData,
      });

      onClose();
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative p-6 bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create a Poll</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="input input-bordered flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="btn btn-ghost btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="btn btn-outline btn-sm mt-2"
              >
                Add Option
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createPoll}
              disabled={!question.trim() || options.some(opt => !opt.trim()) || isCreating}
              className="btn btn-primary flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPoll;
