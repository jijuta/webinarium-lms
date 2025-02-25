'use client'

import { Lesson, Media } from "@prisma/client";
import LessonDialog from "./dialog/lesson-dialog";
import { FilePenLine, GripVertical, Trash2, Video } from "lucide-react";
import DeleteDialog from "./dialog/delete-dialog";
import { useTranslations } from "next-intl";
import { LessonSchemaType } from "@/schemas/courses/course.schema";
import DeleteLesson from "@/actions/course/delete-lesson";
import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import VideoDropzone from "@/components/custom-ui/video-dropzone";
import VideoData from "@/components/custom-ui/video-data";
import { LessonWithVideo } from "@/lib/types/course";
import deleteVideo from "@/actions/course/delete-video";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import VideoDataSkeleton from "@/components/custom-ui/video-data-skeleton";
import socket from "@/socket";
import { getLessonById } from '@/lib/course/course-helper';

type TranslationsFunction = ReturnType<typeof useTranslations>;


interface LessonItemProps {
  lesson: LessonWithVideo;
  index: number;
  t: TranslationsFunction;
  handleUpdate: (values: LessonSchemaType) => void;
  handleDelete: (lessonId: string) => void;
  handleVideoUpload: (updatedLesson: LessonWithVideo) => void;
  isNew?: boolean; // Add this line
}

const LessonItem = ({ lesson, index, t, handleUpdate, handleDelete, handleVideoUpload, isNew }: LessonItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
    const [jobStatus, setJobStatus] = useState(null);
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    console.log('Render LessonItem', lesson, index);

  useEffect(() => {
    const handleJobCompleted = async (data:any) => {
      console.log('jobCompleted', data);
      setJobStatus(data);
      const lessonId = data.data; // Assuming data.data contains the lesson ID
      const result = await getLessonById(lessonId);
      if (result) {
        handleVideoUpload(result)
      }
    };

    socket.on('jobCompleted', handleJobCompleted);

    socket.on('jobFailed', (data) => {
      console.log('jobFailed', data);
      setJobStatus(data);
    });

    return () => {
      socket.off('jobCompleted', handleJobCompleted);
      socket.off('jobFailed');
    };
  }, []);

    const [isVideoBlockVisible, setIsVideoBlockVisible] = useState(isNew || false);

    const handleVideoButtonClick = () => {
        if(isVideoBlockVisible) {
            setIsVideoBlockVisible(false);
        } else {
            setIsVideoBlockVisible(true);
        }
    };
    
    const onSubmit = (values: LessonSchemaType) => {
        handleUpdate(values);
    };

    const onDelete = () => {
        handleDelete(lesson.id);
    };

    const handleVideoDelete = async () => {
      if (!lesson.video) {
        return;
      }
      const result = await deleteVideo(lesson.video.id);
      if (result.success) {
          handleVideoUpload(result.updatedLesson);
      } else {
          console.error(result.error);
      }
  };
  

  return (
    <div ref={setNodeRef} style={style} >
      <div className="flex justify-between items-center p-4 relative">

      <div className="absolute top-0 left-0 right-0 bottom-0 cursor-pointer " onClick={handleVideoButtonClick}>

      </div>

      <div className="flex items-center gap-4" >
        <div className="text-lg font-bold">{index + 1}</div>
        <div>
          <h3 className="text-sm">{lesson.title}</h3>
          <p className="text-sm text-gray-600">{lesson.description}</p>
        </div>

      </div>
      <div className="flex gap-3 items-center relative z-10">

        <Button size="icon" variant={isVideoBlockVisible ? "secondary" : "ghost"} onClick={handleVideoButtonClick} >
            <Video className="cursor-pointer" width={18} height={18} strokeWidth={1}  />
        </Button>

        <LessonDialog
          dialogTitle={t('addForm.lesson.dialogTitleEdit')}
          defaultValues={{ ...lesson, description: lesson.description ?? undefined }}
          dialogTrigger={
          <FilePenLine className="cursor-pointer" width={16} height={16} strokeWidth={1} />
        }
          dialogDescription={t('addForm.lesson.formDescriptionEdit')}
          dialogFooterButton={t('addForm.lesson.editText')}
          onSubmit={onSubmit}
        />
        <DeleteDialog
          dialogTrigger={<Trash2 className="cursor-pointer"  width={16} height={16} strokeWidth={1} />}
          dialogDescription={t('addForm.lesson.deleteText')}
          removeData={onDelete}
        />
         <div  {...listeners} {...attributes}>
            <GripVertical width={16} height={16} strokeWidth={1}/>
         </div>
      </div>
      </div>

        {isVideoBlockVisible ? (
            lesson.video ? (
                lesson.video.isReady ? (
                    <VideoData video={lesson.video} onDelete={handleVideoDelete} />
                ) : (
                    <VideoDataSkeleton/>
                )
            ) : (
                <VideoDropzone lessonId={lesson.id} sectionId={lesson.sectionId} onVideoUpload={handleVideoUpload} />
            )
        ) : (
            <Separator />
        )}
          
    </div>
  );
};

LessonItem.displayName = 'LessonItem';

export default LessonItem;