import type { RefObject } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';
import { Loader2 } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx';

interface MessageInputGroupProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  sending: boolean;
}

export default function MessageInputGroup({ inputRef, onSubmit, sending }: MessageInputGroupProps) {
  return (
    <div className={'MessageInputGroup fixed p-8 bottom-0 left-0 w-full'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <InputGroup className={'bg-background w-full max-w-md m-auto'}>
            <InputGroupInput
              ref={inputRef}
              placeholder="Type a message..."
              autoComplete="off"
              disabled={sending}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                disabled={sending}
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <HugeiconsIcon icon={SentIcon} size={16} />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </form>
    </div>
  );
}
