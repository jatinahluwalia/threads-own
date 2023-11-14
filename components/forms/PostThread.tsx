'use client';

import { createThread } from '@/lib/actions/thread.actions';
import { ThreadValidation } from '@/lib/validations/thread';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';
// import { updateUser } from "@/lib/actions/user.actions";
import { useOrganization } from '@clerk/nextjs';
import React from 'react';

type FormValues = z.infer<typeof ThreadValidation>;

const PostThread: React.FC<{ userId: string }> = ({ userId }) => {
  const { organization } = useOrganization() as any;
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm<FormValues>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId,
    },
    mode: 'all',
  });

  const onSubmit = async (values: FormValues) => {
    await createThread({
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
      text: values.thread,
    });
    router.push('/');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-10 flex flex-col gap-10 justify-start"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;
