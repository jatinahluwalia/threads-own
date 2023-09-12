"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Props {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: Props) => {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
};

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching threads: ${error.message}`);
  }
};

export const fetchThreadById = async (id: string) => {
  try {
    connectToDB();
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name image",
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
};

export const addCommentToThread = async (
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) => {
  try {
    connectToDB();
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Thread not found");
    const commentThread = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    originalThread.children.push(commentThread._id);
    originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error commenting: ${error.message}`);
  }
};
